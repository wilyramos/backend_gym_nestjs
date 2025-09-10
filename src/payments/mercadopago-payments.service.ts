import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MercadoPagoPaymentsService {
    private readonly logger = new Logger(MercadoPagoPaymentsService.name);
    private readonly api = axios.create({
        baseURL: 'https://api.mercadopago.com',
        headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    /**
     * Consulta un authorized_payment específico
     */
    async getAuthorizedPayment(authorizedPaymentId: string) {
        try {
            const { data } = await this.api.get(
                `/authorized_payments/${authorizedPaymentId}`,
            );

            this.logger.log(
                `Detalle de authorized_payment [${authorizedPaymentId}]: ${JSON.stringify(
                    data,
                )}`,
            );

            return data;
        } catch (err) {
            this.logger.error(
                `Error consultando authorized_payment ${authorizedPaymentId}`,
                err.response?.data || err.message,
            );
            throw err;
        }
    }

    /**
     * Consulta un preapproval (suscripción recurrente)
     */
    async getPreapproval(preapprovalId: string) {
        try {
            const { data } = await this.api.get(`/preapproval/${preapprovalId}`);

            this.logger.log(
                `Detalle de preapproval [${preapprovalId}]: ${JSON.stringify(data)}`,
            );

            return data;
        } catch (err) {
            this.logger.error(
                `Error consultando preapproval ${preapprovalId}`,
                err.response?.data || err.message,
            );
            throw err;
        }
    }

    /**
     * (Opcional) Cancelar un preapproval
     */
    async cancelPreapproval(preapprovalId: string) {
        try {
            const { data } = await this.api.put(`/preapproval/${preapprovalId}`, {
                status: 'cancelled',
            });

            this.logger.log(
                `Preapproval ${preapprovalId} cancelado correctamente: ${JSON.stringify(
                    data,
                )}`,
            );

            return data;
        } catch (err) {
            this.logger.error(
                `Error cancelando preapproval ${preapprovalId}`,
                err.response?.data || err.message,
            );
            throw err;
        }
    }
}
