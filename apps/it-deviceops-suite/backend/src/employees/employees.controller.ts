import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Res, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { Response } from 'express';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los empleados' })
  @ApiQuery({ name: 'siteId', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de empleados' })
  async getEmployees(@Query('siteId') siteId?: string, @Query('isActive') isActive?: string) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    const data = await this.employeesService.findAll(
      siteId ? parseInt(siteId) : undefined,
      isActiveBool
    );
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  @ApiResponse({ status: 200, description: 'Detalles del empleado' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async getEmployeeById(@Param('id') id: string) {
    const data = await this.employeesService.findOne(parseInt(id));
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado' })
  async createEmployee(@Body() dto: CreateEmployeeDto, @Request() req: RequestWithUser) {
    const result = await this.employeesService.create(dto, req.user.userId);
    return {
      message: 'Empleado creado exitosamente',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un empleado' })
  @ApiResponse({ status: 200, description: 'Empleado actualizado' })
  async updateEmployee(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @Request() req: RequestWithUser) {
    const result = await this.employeesService.update(parseInt(id), dto, req.user.userId);
    return {
      message: 'Empleado actualizado exitosamente',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un empleado (soft delete)' })
  @ApiResponse({ status: 200, description: 'Empleado eliminado' })
  async deleteEmployee(@Param('id') id: string) {
    await this.employeesService.softDelete(parseInt(id));
    return {
      message: 'Empleado eliminado exitosamente',
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar empleados a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.employeesService.exportToExcel();
    const fileName = `employees-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  }

  @Post('import-excel')
  @ApiOperation({ summary: 'Importar empleados desde Excel' })
  @ApiResponse({ status: 200, description: 'Empleados importados' })
  async importEmployeesFromExcel(@Body('employees') employees: any[], @Request() req: RequestWithUser) {
    const result = await this.employeesService.importFromExcel(employees, req.user.userId);
    return {
      message: `Importación completada: ${result.insertados} creados`,
      data: result,
    };
  }

  @Post('update-duplicates-excel')
  @ApiOperation({ summary: 'Actualizar empleados duplicados desde Excel' })
  @ApiResponse({ status: 200, description: 'Empleados actualizados' })
  async updateDuplicatesFromExcel(@Body('duplicates') duplicates: any[], @Request() req: RequestWithUser) {
    const result = await this.employeesService.updateDuplicatesFromExcel(duplicates, req.user.userId);
    return {
      message: `Actualización completada: ${result.actualizados} actualizados`,
      data: result,
    };
  }

  @Get('template/excel')
  @ApiOperation({ summary: 'Descargar plantilla Excel para importar empleados' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.employeesService.generateTemplate();
    const fileName = `employees-template-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  }
}
