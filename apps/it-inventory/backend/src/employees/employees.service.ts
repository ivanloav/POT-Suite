import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async findAll(siteId?: number, isActive?: boolean) {
    const where: any = {};
    if (siteId) {
      where.siteId = siteId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    return await this.employeeRepository.find({
      where,
      relations: ['site', 'creator'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    try {
      const employee = await this.employeeRepository.findOne({
        where: { id },
        relations: ['site'],
      });

      if (!employee) {
        throw new Error('Empleado no encontrado');
      }

      // Intentar cargar creator y updater si existen
      if (employee.createdBy) {
        try {
          const withCreator = await this.employeeRepository.findOne({
            where: { id },
            relations: ['creator'],
          });
          if (withCreator?.creator) {
            employee.creator = withCreator.creator;
          }
        } catch (error) {
          console.log('No se pudo cargar creator');
        }
      }

      if (employee.updatedBy) {
        try {
          const withUpdater = await this.employeeRepository.findOne({
            where: { id },
            relations: ['updater'],
          });
          if (withUpdater?.updater) {
            employee.updater = withUpdater.updater;
          }
        } catch (error) {
          console.log('No se pudo cargar updater');
        }
      }

      // Cargar assignments por separado si existen
      try {
        const employeeWithAssignments = await this.employeeRepository.findOne({
          where: { id },
          relations: ['assignments', 'assignments.asset', 'assignments.asset.type'],
        });
        
        if (employeeWithAssignments) {
          employee.assignments = employeeWithAssignments.assignments || [];
        }
      } catch (error) {
        console.log('No se pudo cargar assignments');
        employee.assignments = [];
      }

      return employee;
    } catch (error) {
      console.error('Error en findOne:', error);
      throw new Error('Empleado no encontrado');
    }
  }

  async create(data: CreateEmployeeDto, userId?: number) {
    const employee = this.employeeRepository.create({
      ...data,
      createdBy: userId,
    });
    
    try {
      const savedEmployee = await this.employeeRepository.save(employee);
      return await this.employeeRepository.findOne({
        where: { id: savedEmployee.id },
        relations: ['site', 'creator', 'updater'],
      });
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_employees_site_email')) {
          throw new ConflictException(`Ya existe un empleado con el email "${data.email}" en este sitio`);
        } else if (constraintName?.includes('ux_employees_site_fullname')) {
          const fullName = `${data.firstName} ${data.lastName}${data.secondLastName ? ' ' + data.secondLastName : ''}`;
          throw new ConflictException(`Ya existe un empleado con el nombre "${fullName}" en este sitio`);
        }
        throw new ConflictException('Ya existe un empleado con esos datos en este sitio');
      }
      throw error;
    }
  }

  async update(id: number, data: UpdateEmployeeDto, userId?: number) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['site', 'creator', 'updater'],
    });
    
    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }
    
    // Asignar siteId explícitamente y castear a number si viene como string
    if (data.siteId !== undefined) {
      employee.siteId = Number(data.siteId);
    }
    // Eliminar la relación site para evitar que TypeORM la priorice
    if (employee.site) {
      employee.site = undefined;
    }
    Object.assign(employee, data);
    if (userId) {
      employee.updatedBy = userId;
    }
    
    try {
      await this.employeeRepository.save(employee);
      // Recargar con todas las relaciones actualizadas
      return await this.employeeRepository.findOne({
        where: { id },
        relations: ['site', 'creator', 'updater'],
      });
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_employees_site_email')) {
          throw new ConflictException(`Ya existe un empleado con el email "${data.email}" en este sitio`);
        } else if (constraintName?.includes('ux_employees_site_fullname')) {
          const fullName = `${data.firstName || employee.firstName} ${data.lastName || employee.lastName}${(data.secondLastName || employee.secondLastName) ? ' ' + (data.secondLastName || employee.secondLastName) : ''}`;
          throw new ConflictException(`Ya existe un empleado con el nombre "${fullName}" en este sitio`);
        }
        throw new ConflictException('Ya existe un empleado con esos datos en este sitio');
      }
      throw error;
    }
  }

  async softDelete(id: number) {
    const employee = await this.findOne(id);
    
    // Verificar si tiene asignaciones (trazabilidad)
    if (employee.assignments && employee.assignments.length > 0) {
      throw new Error(
        'No se puede eliminar el empleado porque tiene asignaciones de activos registradas. ' +
        'La trazabilidad debe mantenerse por motivos de auditoría.'
      );
    }
    
    employee.isActive = false;
    return await this.employeeRepository.save(employee);
  }

  // Conversión snake_case/Space Case a camelCase
  private snakeToCamel(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => this.snakeToCamel(v));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        // Convertir a lowercase primero para evitar problemas con "ID" → "iD"
        const lowerKey = key.toLowerCase();
        const camelKey = lowerKey
          .replace(/\s+(.)/g, (_, g) => g.toUpperCase()) // Espacios a camelCase
          .replace(/_(.)/g, (_, g) => g.toUpperCase()); // Guiones bajos a camelCase
        
        acc[camelKey] = this.snakeToCamel(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  }

  async exportToExcel(): Promise<Buffer> {
    const employees = await this.employeeRepository.find({
      relations: ['site'],
      order: { id: 'ASC' },
    });

    const data = employees.map(emp => ({
      'ID': emp.id,
      'Site ID': emp.siteId,
      'Sede': emp.site?.name || '',
      'Nombre': emp.firstName,
      'Apellido': emp.lastName,
      'Segundo Apellido': emp.secondLastName || '',
      'Email': emp.email || '',
      'Teléfono': emp.phone || '',
      'Activo': emp.isActive ? 'Sí' : 'No',
      'Notas': emp.notes || '',
      'Fecha Creación': emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('es-ES') : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

    worksheet['!cols'] = [
      { wch: 8 },  // ID
      { wch: 10 }, // Site ID
      { wch: 20 }, // Sede
      { wch: 15 }, // Nombre
      { wch: 15 }, // Apellido
      { wch: 18 }, // Segundo Apellido
      { wch: 30 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 10 }, // Activo
      { wch: 30 }, // Notas
      { wch: 15 }, // Fecha Creación
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importFromExcel(employees: any[], userId?: number): Promise<any> {
    const createdEmployees: Employee[] = [];
    const duplicates: any[] = [];
    const errors: { row: number; error: string }[] = [];

    for (const [index, employeeDataOriginal] of employees.entries()) {
      const employeeData = this.snakeToCamel(employeeDataOriginal);

      try {
        // Validar campos requeridos
        if (!employeeData.siteId || !employeeData.firstName || !employeeData.lastName) {
          errors.push({ row: index + 2, error: 'Faltan campos requeridos (siteId, firstName, lastName)' });
          continue;
        }

        // Verificar si el email ya existe (si se proporciona)
        let existingEmployee = null;
        if (employeeData.email) {
          existingEmployee = await this.employeeRepository.findOne({
            where: { email: employeeData.email },
          });
        }

        const dto: CreateEmployeeDto = {
          siteId: Number(employeeData.siteId),
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          secondLastName: employeeData.secondLastName || undefined,
          email: employeeData.email || undefined,
          phone: employeeData.phone || undefined,
          isActive: employeeData.isActive !== undefined 
            ? (employeeData.isActive === true || employeeData.isActive === 'true' || employeeData.isActive === 'TRUE' || employeeData.isActive === 'True' || employeeData.isActive === 1)
            : true,
          notes: employeeData.notes || undefined,
        };

        if (existingEmployee) {
          // Si existe, agregarlo a la lista de duplicados
          duplicates.push({
            row: index + 2,
            email: employeeData.email,
            existingId: existingEmployee.id,
            data: dto,
          });
        } else {
          // Si no existe, crear nuevo
          const created = await this.create(dto, userId);
          if (created) {
            createdEmployees.push(created);
          }
        }
      } catch (err) {
        let errorMsg = '';
        if (typeof err === 'object' && err !== null) {
          const error = err as any;
          
          // Mensajes de error específicos para PostgreSQL
          if (error.code === '23505') {
            // Violación de constraint único
            if (error.detail) {
              const match = error.detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
              if (match) {
                const field = match[1];
                const value = match[2];
                errorMsg = `El campo ${field} con valor "${value}" ya existe`;
              } else {
                errorMsg = 'Valor duplicado detectado';
              }
            } else {
              errorMsg = 'Valor duplicado detectado';
            }
          } else if (error.message) {
            errorMsg = error.message;
          } else {
            errorMsg = String(err);
          }
        } else {
          errorMsg = String(err);
        }
        errors.push({ row: index + 2, error: errorMsg });
      }
    }

    return {
      insertados: createdEmployees.length,
      duplicados: duplicates,
      errores: errors,
      datos: createdEmployees,
    };
  }

  async updateDuplicatesFromExcel(duplicates: any[], userId?: number): Promise<any> {
    const updatedEmployees: Employee[] = [];
    const errors: { row: number; error: string }[] = [];

    for (const duplicate of duplicates) {
      try {
        const updated = await this.update(duplicate.existingId, duplicate.data, userId);
        if (updated) {
          updatedEmployees.push(updated);
        }
      } catch (err) {
        let errorMsg = '';
        if (typeof err === 'object' && err !== null && 'message' in err) {
          errorMsg = (err as any).message;
        } else {
          errorMsg = String(err);
        }
        errors.push({ row: duplicate.row, error: errorMsg });
      }
    }

    return {
      actualizados: updatedEmployees.length,
      errores: errors,
      datos: updatedEmployees,
    };
  }

  async generateTemplate(): Promise<Buffer> {
    // Ejemplos con comentarios
    const examples = [
      {
        'Site ID': '⚠️ CONSULTAR SELECTOR DE SEDE',
        'First Name': 'Juan',
        'Last Name': 'Pérez',
        'Second Last Name': 'García',
        'Email': 'juan.perez@empresa.com',
        'Phone': '612345678',
        'Is Active': 'true',
        'Notes': 'EJEMPLO: Empleado del departamento de TI',
      },
      {
        'Site ID': '',
        'First Name': 'María',
        'Last Name': 'González',
        'Second Last Name': 'López',
        'Email': 'maria.gonzalez@empresa.com',
        'Phone': '687654321',
        'Is Active': 'true',
        'Notes': 'EJEMPLO: Empleada del departamento de administración',
      },
      {
        'Site ID': '',
        'First Name': 'Carlos',
        'Last Name': 'Martínez',
        'Second Last Name': '',
        'Email': '',
        'Phone': '',
        'Is Active': 'true',
        'Notes': '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

    // Añadir hoja con instrucciones
    const instructions = [
      { Field: 'Site ID', Required: 'Yes', Description: 'ID de la sede (número)' },
      { Field: 'First Name', Required: 'Yes', Description: 'Nombre del empleado' },
      { Field: 'Last Name', Required: 'Yes', Description: 'Primer apellido' },
      { Field: 'Second Last Name', Required: 'No', Description: 'Segundo apellido (opcional)' },
      { Field: 'Email', Required: 'No', Description: 'Correo electrónico (único, opcional)' },
      { Field: 'Phone', Required: 'No', Description: 'Teléfono de contacto' },
      { Field: 'Is Active', Required: 'No', Description: 'true o false (por defecto: true)' },
      { Field: 'Notes', Required: 'No', Description: 'Notas adicionales o comentarios' },
    ];
    const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    worksheet['!cols'] = [
      { wch: 35 },  // Site ID (con advertencia)
      { wch: 15 },  // First Name
      { wch: 15 },  // Last Name
      { wch: 18 },  // Second Last Name
      { wch: 30 },  // Email
      { wch: 15 },  // Phone
      { wch: 12 },  // Is Active
      { wch: 50 },  // Notes
    ];
    instructionsSheet['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 60 }];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
