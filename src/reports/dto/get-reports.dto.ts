import { IsOptional, IsDateString } from 'class-validator';


export class GetReportsDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}