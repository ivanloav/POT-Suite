import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { AssetAssignment } from '../entities/asset-assignment.entity';
import { Asset } from '../entities/asset.entity';
import { AssetStatus } from '../entities/asset-status.entity';
import { Employee } from '../entities/employee.entity';
import { Site } from '../entities/site.entity';
import { CreateAssignmentDto, ReturnAssignmentDto } from './dto/assignment.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(AssetAssignment)
    private readonly assignmentRepository: Repository<AssetAssignment>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(AssetStatus)
    private readonly statusRepository: Repository<AssetStatus>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  async findAll() {
    return await this.assignmentRepository.find({
      relations: ['asset', 'asset.type', 'asset.model', 'asset.model.brand', 'asset.site', 'employee', 'employee.site', 'site'],
      order: { id: 'DESC' },
    });
  }

  async findActive() {
    return await this.assignmentRepository.find({
      where: { returnedAt: IsNull() },
      relations: ['asset', 'asset.type', 'asset.model', 'asset.model.brand', 'asset.site', 'employee', 'employee.site', 'site'],
      order: { id: 'DESC' },
    });
  }

  async findByEmployee(employeeId: number) {
    return await this.assignmentRepository.find({
      where: { employeeId },
      relations: ['asset', 'asset.type', 'asset.model', 'asset.model.brand'],
      order: { id: 'DESC' },
    });
  }

  async create(data: CreateAssignmentDto, userId: number) {
    // Verificar si el activo tiene una asignación activa
    const activeAssignment = await this.assignmentRepository.findOne({
      where: {
        assetId: data.assetId,
        returnedAt: IsNull(),
      },
    });

    // Si tiene asignación activa, devolverla automáticamente
    if (activeAssignment) {
      // Usar la fecha de la nueva asignación como fecha de devolución de la anterior
      // Si la nueva asignación es en el pasado respecto a la anterior, usar la fecha actual
      const newAssignmentDate = data.assignedAt ? new Date(data.assignedAt) : new Date();
      const currentDate = new Date();
      
      // Usar la fecha más reciente entre la fecha de asignación anterior y la fecha actual
      const returnDate = new Date(Math.max(
        activeAssignment.assignedAt.getTime(),
        Math.min(newAssignmentDate.getTime(), currentDate.getTime())
      ));
      
      activeAssignment.returnedAt = returnDate;
      await this.assignmentRepository.save(activeAssignment);
    }

    // Crear nueva asignación
    const assignment = this.assignmentRepository.create({
      ...data,
      createdBy: userId,
    });

    const savedAssignment = await this.assignmentRepository.save(assignment);

    // Obtener el status 'assigned'
    const assignedStatus = await this.statusRepository.findOne({
      where: { code: 'assigned' },
    });

    if (!assignedStatus) {
      throw new Error('Estado "assigned" no encontrado en la base de datos');
    }

    // Actualizar estado del activo y asignar empleado
    await this.assetRepository.update(data.assetId, {
      statusId: assignedStatus.id,
      employeeId: data.employeeId,
    });

    return savedAssignment;
  }

  async returnAsset(id: number, data: ReturnAssignmentDto) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['asset'],
    });

    if (!assignment) {
      throw new Error('Asignación no encontrada');
    }

    if (assignment.returnedAt) {
      throw new Error('Esta asignación ya fue devuelta');
    }

    // Actualizar asignación
    assignment.returnedAt = data.returnedAt ? new Date(data.returnedAt) : new Date();
    if (data.comment) {
      assignment.comment = data.comment;
    }

    const updatedAssignment = await this.assignmentRepository.save(assignment);

    // Verificar si quedan asignaciones activas para este activo
    const activeAssignmentsCount = await this.assignmentRepository.count({
      where: {
        assetId: assignment.assetId,
        returnedAt: IsNull(),
      },
    });

    // Si no hay más asignaciones activas, actualizar el activo
    if (activeAssignmentsCount === 0) {
      // Obtener el status 'in_stock'
      const inStockStatus = await this.statusRepository.findOne({
        where: { code: 'in_stock' },
      });

      if (!inStockStatus) {
        throw new Error('Estado "in_stock" no encontrado en la base de datos');
      }

      // Actualizar estado del activo y eliminar employeeId
      await this.assetRepository
        .createQueryBuilder()
        .update(Asset)
        .set({
          statusId: inStockStatus.id,
          employeeId: () => 'NULL',
        })
        .where('id = :id', { id: assignment.assetId })
        .execute();
    }

    return updatedAssignment;
  }

  async generateTemplate(): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    
    // Obtener datos de catálogos para ejemplos
    const assets = await this.assetRepository.find({ take: 3, relations: ['model', 'model.brand'] });
    const employees = await this.employeeRepository.find({ take: 3 });
    
    const examples = [
      {
        'Asset Tag': assets[0]?.assetTag || 'LAP-001',
        'Employee Name': employees[0] ? `${employees[0].firstName} ${employees[0].lastName}` : 'Juan Pérez García',
        'Site Code': 'MAD',
        'Assigned At (YYYY-MM-DD HH:mm)': '2026-01-22 14:00',
        'Comment': 'Asignación de laptop a empleado',
      },
      {
        'Asset Tag': assets[1]?.assetTag || 'MOB-002',
        'Employee Name': employees[1] ? `${employees[1].firstName} ${employees[1].lastName}` : 'María García López',
        'Site Code': 'BCN',
        'Assigned At (YYYY-MM-DD HH:mm)': '2026-01-20 10:30',
        'Comment': 'Móvil corporativo',
      },
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(examples);
    
    // Ajustar anchos de columna
    worksheet['!cols'] = [
      { wch: 20 },  // Asset Tag
      { wch: 35 },  // Employee Name
      { wch: 12 },  // Site Code
      { wch: 30 },  // Assigned At
      { wch: 40 },  // Comment
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assignments');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportToExcel(): Promise<Buffer> {
    const assignments = await this.findAll();
    
    const data = assignments.map(assignment => ({
      'ID': assignment.id,
      'Asset Tag': assignment.asset?.assetTag || '',
      'Asset Model': assignment.asset?.model ? `${(assignment.asset.model as any).brand?.name || ''} ${(assignment.asset.model as any).name || ''}` : '',
      'Employee': `${assignment.employee?.firstName || ''} ${assignment.employee?.lastName || ''}`,
      'Site': assignment.site?.name || '',
      'Assigned At': assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }) : '',
      'Returned At': assignment.returnedAt ? new Date(assignment.returnedAt).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }) : '',
      'Status': assignment.returnedAt ? 'Devuelto' : 'Activo',
      'Comment': assignment.comment || '',
    }));
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Ajustar anchos de columna
    worksheet['!cols'] = [
      { wch: 8 },   // ID
      { wch: 20 },  // Asset Tag
      { wch: 30 },  // Asset Model
      { wch: 25 },  // Employee
      { wch: 15 },  // Site
      { wch: 20 },  // Assigned At
      { wch: 20 },  // Returned At
      { wch: 12 },  // Status
      { wch: 40 },  // Comment
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assignments');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importFromExcel(data: any[], userId: number) {
    const results = {
      insertados: 0,
      errores: [] as any[],
    };
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // +2 porque Excel empieza en 1 y hay header
      
      try {
        // Leer campos del Excel (ahora con nombres descriptivos)
        const assetTag = row['Asset Tag'] || row['assetTag'];
        const employeeName = row['Employee Name'] || row['employeeName'];
        const siteCode = row['Site Code'] || row['siteCode'];
        const assignedAt = row['Assigned At (YYYY-MM-DD HH:mm)'] || row['assignedAt'];
        const comment = row['Comment'] || row['comment'];
        
        if (!assetTag || !employeeName || !siteCode) {
          results.errores.push({
            fila: rowNum,
            error: 'Asset Tag, Employee Name y Site Code son obligatorios',
          });
          continue;
        }
        
        // Buscar activo por Asset Tag
        const asset = await this.assetRepository.findOne({ 
          where: { assetTag: assetTag.toString().trim() } 
        });
        
        if (!asset) {
          results.errores.push({
            fila: rowNum,
            error: `Activo con Asset Tag "${assetTag}" no encontrado`,
          });
          continue;
        }
        
        // Buscar empleado por nombre completo (firstName + lastName)
        const nameParts = employeeName.toString().trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        const employees = await this.employeeRepository.find();
        const employee = employees.find(emp => 
          `${emp.firstName} ${emp.lastName}`.toLowerCase() === employeeName.toString().trim().toLowerCase()
        );
        
        if (!employee) {
          results.errores.push({
            fila: rowNum,
            error: `Empleado con nombre "${employeeName}" no encontrado`,
          });
          continue;
        }
        
        // Buscar sede por código
        const site = await this.siteRepository.findOne({ 
          where: { code: siteCode.toString().trim().toUpperCase() } 
        });
        
        if (!site) {
          results.errores.push({
            fila: rowNum,
            error: `Sede con código "${siteCode}" no encontrada`,
          });
          continue;
        }
        
        await this.create(
          {
            assetId: asset.id,
            employeeId: employee.id,
            siteId: site.siteId,
            assignedAt: assignedAt || undefined,
            comment: comment || undefined,
          },
          userId,
        );
        
        results.insertados++;
      } catch (error: any) {
        results.errores.push({
          fila: rowNum,
          error: error.message || 'Error desconocido',
        });
      }
    }
    
    return results;
  }
}
