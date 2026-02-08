import { Controller, Get, Post, Param, Body, UseGuards, Res, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, ReturnAssignmentDto } from './dto/assignment.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('Assignments')
@Controller('assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las asignaciones' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones' })
  async getAssignments() {
    const data = await this.assignmentsService.findAll();
    return { data };
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Listar activos asignados a un empleado' })
  @ApiResponse({ status: 200, description: 'Activos del empleado' })
  async getEmployeeAssets(@Param('employeeId') employeeId: string) {
    const data = await this.assignmentsService.findByEmployee(parseInt(employeeId));
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva asignación' })
  @ApiResponse({ status: 201, description: 'Asignación creada' })
  async createAssignment(@Body() dto: CreateAssignmentDto, @Request() req: RequestWithUser) {
    const result = await this.assignmentsService.create(dto, req.user.userId);
    return {
      message: 'Activo asignado exitosamente',
      data: result,
    };
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Devolver un activo asignado' })
  @ApiResponse({ status: 200, description: 'Activo devuelto' })
  async returnAssignment(@Param('id') id: string, @Body() dto: ReturnAssignmentDto) {
    const result = await this.assignmentsService.returnAsset(parseInt(id), dto);
    return {
      message: 'Activo devuelto exitosamente',
      data: result,
    };
  }

  @Get('template')
  @ApiOperation({ summary: 'Descargar plantilla Excel para asignaciones' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.assignmentsService.generateTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="assignments-template.xlsx"`);
    res.send(buffer);
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar asignaciones a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.assignmentsService.exportToExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="assignments-${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  }

  @Post('import/excel')
  @ApiOperation({ summary: 'Importar asignaciones desde Excel' })
  @ApiResponse({ status: 200, description: 'Importación completada' })
  async importFromExcel(@Body('assignments') assignments: any[], @Request() req: RequestWithUser) {
    const result = await this.assignmentsService.importFromExcel(assignments, req.user.userId);
    return {
      message: 'Asignaciones importadas exitosamente',
      data: result,
    };
  }
}
