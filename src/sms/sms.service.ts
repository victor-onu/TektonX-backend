import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface BulkSMSResponse {
  status: string;
  code: string;
  message: string;
  data?: {
    message_id: string;
    cost: number;
    currency: string;
    recipients_count: number;
    gateway_used: string;
  };
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl: string;
  private readonly apiToken: string;
  private readonly senderId: string;

  constructor(private readonly config: ConfigService) {
    this.apiUrl =
      this.config.get<string>('BULKSMS_API_URL') ||
      'https://www.bulksmsnigeria.com/api/v2/sms';
    this.apiToken = this.config.get<string>('BULKSMS_API_TOKEN') || '';
    this.senderId = this.config.get<string>('BULKSMS_SENDER_ID') || 'TektonX';
  }

  /**
   * Send SMS to one or more recipients
   * @param to - Comma-separated phone numbers (e.g., "2347037770033,2349050030090")
   * @param message - The SMS message body
   * @returns Promise with send result
   */
  async sendSMS(
    to: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.apiToken) {
      this.logger.error(
        '[SMS CONFIG ERROR] BULKSMS_API_TOKEN is not configured',
      );
      return {
        success: false,
        error: 'SMS service not configured',
      };
    }

    try {
      const response = await axios.post<BulkSMSResponse>(
        this.apiUrl,
        {
          from: this.senderId,
          to,
          body: message,
          gateway: 'direct-refund',
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 30000, // 30 second timeout
        },
      );

      if (response.data.status === 'success') {
        this.logger.log(
          `[SMS SENT] To: ${to} | Message ID: ${response.data.data?.message_id} | Cost: ${response.data.data?.cost} ${response.data.data?.currency}`,
        );
        return {
          success: true,
          messageId: response.data.data?.message_id,
        };
      } else {
        this.logger.error(
          `[SMS FAILED] To: ${to} | ${response.data.message}`,
        );
        return {
          success: false,
          error: response.data.message,
        };
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        'Unknown error';
      this.logger.error(`[SMS ERROR] To: ${to} | ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Calculate how many SMS pages a message will use
   * Standard SMS: 160 chars = 1 page, then 153 chars per page after that
   * @param message - The message text
   * @returns Number of pages
   */
  calculateSMSPages(message: string): number {
    const length = message.length;
    if (length === 0) return 0;
    if (length <= 160) return 1;
    // Concatenated SMS: first 160 chars, then 153 per subsequent page
    // But BulkSMS Nigeria uses 153 per page after the first page
    return Math.ceil((length - 160) / 153) + 1;
  }
}
