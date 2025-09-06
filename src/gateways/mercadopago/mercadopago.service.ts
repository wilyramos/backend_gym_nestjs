import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { MP_CONFIG } from '../../config/mercadopago.config';

@Injectable()
export class MercadoPagoService {
    private readonly api = axios.create({
        baseURL: MP_CONFIG.BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${MP_CONFIG.TOKEN}`,
        },
    });


    // Create preferencea (Unique payment)
    async createPreference(orderId: number, amount: number, description: string) {
        try {
            const { data } = await this.api.post('/checkout/preferences', {
                items: [
                    {
                        title: description,
                        quantity: 1,
                        currency_id: 'PEN',
                        unit_price: amount,
                    },
                ],
                back_urls: {
                    success: 'http://localhost:3000/payment/success',
                    failure: 'http://localhost:3000/payment/failure',
                    pending: 'http://localhost:3000/payment/pending',
                },
                auto_return: 'approved',
                external_reference: String(orderId),
            });

            return data;
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Error creando preferencia',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // Create subscription (Recurring payment) Preapproval
    async createSubscription(planName: string, frequency: number, amount: number) {
        try {
            const { data } = await this.api.post('/preapproval', {
                reason: planName,
                auto_recurring: {
                    frequency,
                    frequency_type: 'months',
                    transaction_amount: amount,
                    currency_id: 'PEN',
                    start_date: new Date().toISOString(),
                    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                },
                back_url: 'http://localhost:3000/subscription/return',
                payer_email: 'cliente@correo.com',
            });

            return data;
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Error creando suscripción',
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
