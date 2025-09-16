import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { MP_CONFIG } from '../../config/mercadopago.config';

@Injectable()
export class MercadoPagoService {

    private readonly api = axios.create({
        baseURL: MP_CONFIG.BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN || MP_CONFIG.TOKEN}`,
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
    async createSubscription(planName: string, frequency: number, amount: number, email: string, subscriptionId?: number) {

        try {
            console.log("Creating subscription with:", { planName, frequency, amount, email, subscriptionId });
            const start = new Date();
            start.setMinutes(start.getMinutes() + 5);

            const auto_recurring = {
                frequency,
                frequency_type: 'months',
                transaction_amount: amount,
                currency_id: 'PEN',
                start_date: start.toISOString(),
                // end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            };

            console.log(JSON.stringify({
                reason: planName,
                auto_recurring,
                back_url: process.env.MP_BACK_URL,
                payer_email: email,
                external_reference: subscriptionId?.toString(),
            }, null, 2));

            const { data } = await this.api.post('/preapproval', {
                reason: planName,
                auto_recurring,
                back_url: process.env.MP_BACK_URL || 'http://localhost:3000/memberships',
                payer_email: email,
                external_reference: subscriptionId ? String(subscriptionId) : undefined,
            });
            console.log("Create subscription response:", data?.response);
            
            return data;
        } catch (error) {
            console.error("Error creating subscription:", error);
            throw new HttpException(
                error.response?.data || 'Error creando suscripción',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // Cancel subscription
    async cancelSubscription(preapprovalId: string) {
        try {
            const { data } = await this.api.put(`/preapproval/${preapprovalId}`, {
                status: 'cancelled',
            });
            console.log("Cancel subscription response:", data);
            return data;
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Error cancelando suscripción',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async getSubscription(preapprovalId: string) {
        try {
            const { data } = await this.api.get(`/preapproval/${preapprovalId}`);
            return data;
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Error obteniendo suscripción',
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}