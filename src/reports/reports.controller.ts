import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GetReportsDto } from './dto/get-reports.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard.ts';

@Controller('reports')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('dashboard')
    // @Roles('ADMIN')
    getDashboardMetrics(@Query() query: GetReportsDto) {
        console.log('Query parameters recibidos en controller:', query);
        return this.reportsService.getDashboardMetrics(query);
    }
}
