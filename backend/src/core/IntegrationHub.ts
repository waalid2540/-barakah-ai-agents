// Barakah AI Agents - Integration Hub for External Services
import axios from 'axios';
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'email' | 'social' | 'payment' | 'crm' | 'storage' | 'communication';
  requiredKeys: string[];
  endpoints: Record<string, string>;
}

export interface IntegrationResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
  integration: string;
}

export class IntegrationHub {
  private integrations: Map<string, IntegrationConfig> = new Map();

  constructor() {
    this.initializeIntegrations();
  }

  private initializeIntegrations() {
    // Gmail Integration (using SMTP with App Password)
    this.integrations.set('gmail', {
      id: 'gmail',
      name: 'Gmail',
      type: 'email',
      requiredKeys: ['gmail_email', 'gmail_app_password'],
      endpoints: {
        smtp: 'smtp.gmail.com'
      }
    });

    // LinkedIn Integration
    this.integrations.set('linkedin', {
      id: 'linkedin',
      name: 'LinkedIn',
      type: 'social',
      requiredKeys: ['linkedin_access_token'],
      endpoints: {
        post: 'https://api.linkedin.com/v2/ugcPosts',
        profile: 'https://api.linkedin.com/v2/people/~'
      }
    });

    // Facebook Integration
    this.integrations.set('facebook', {
      id: 'facebook',
      name: 'Facebook',
      type: 'social',
      requiredKeys: ['facebook_access_token', 'facebook_page_id'],
      endpoints: {
        post: 'https://graph.facebook.com/v18.0/{page-id}/feed',
        pages: 'https://graph.facebook.com/v18.0/me/accounts'
      }
    });

    // Twitter Integration
    this.integrations.set('twitter', {
      id: 'twitter',
      name: 'Twitter',
      type: 'social',
      requiredKeys: ['twitter_api_key', 'twitter_access_token'],
      endpoints: {
        tweet: 'https://api.twitter.com/2/tweets',
        user: 'https://api.twitter.com/2/users/me'
      }
    });

    // Stripe Integration
    this.integrations.set('stripe', {
      id: 'stripe',
      name: 'Stripe',
      type: 'payment',
      requiredKeys: ['stripe_secret_key'],
      endpoints: {
        products: 'https://api.stripe.com/v1/products',
        prices: 'https://api.stripe.com/v1/prices',
        checkout: 'https://api.stripe.com/v1/checkout/sessions'
      }
    });

    // HubSpot Integration
    this.integrations.set('hubspot', {
      id: 'hubspot',
      name: 'HubSpot',
      type: 'crm',
      requiredKeys: ['hubspot_api_key'],
      endpoints: {
        contacts: 'https://api.hubapi.com/crm/v3/objects/contacts',
        deals: 'https://api.hubapi.com/crm/v3/objects/deals',
        companies: 'https://api.hubapi.com/crm/v3/objects/companies'
      }
    });

    // WordPress Integration
    this.integrations.set('wordpress', {
      id: 'wordpress',
      name: 'WordPress',
      type: 'communication',
      requiredKeys: ['wordpress_url', 'wordpress_username', 'wordpress_app_password'],
      endpoints: {
        posts: '{wordpress_url}/wp-json/wp/v2/posts',
        media: '{wordpress_url}/wp-json/wp/v2/media'
      }
    });

    logger.info(`✅ Initialized ${this.integrations.size} integrations`);
  }

  async execute(integrationId: string, input: any): Promise<IntegrationResult> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      return {
        success: false,
        error: `Integration ${integrationId} not found`,
        timestamp: new Date(),
        integration: integrationId
      };
    }

    const apiKeys = input.apiKeys || {};
    
    // Validate required API keys
    for (const key of integration.requiredKeys) {
      if (!apiKeys[key]) {
        return {
          success: false,
          error: `Missing required API key: ${key}`,
          timestamp: new Date(),
          integration: integrationId
        };
      }
    }

    try {
      switch (integrationId) {
        case 'gmail':
          return await this.executeGmail(input, apiKeys);
        case 'linkedin':
          return await this.executeLinkedIn(input, apiKeys);
        case 'facebook':
          return await this.executeFacebook(input, apiKeys);
        case 'twitter':
          return await this.executeTwitter(input, apiKeys);
        case 'stripe':
          return await this.executeStripe(input, apiKeys);
        case 'hubspot':
          return await this.executeHubSpot(input, apiKeys);
        case 'wordpress':
          return await this.executeWordPress(input, apiKeys);
        default:
          return {
            success: false,
            error: `Integration ${integrationId} not implemented`,
            timestamp: new Date(),
            integration: integrationId
          };
      }
    } catch (error: any) {
      logger.error(`❌ Integration ${integrationId} failed:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        integration: integrationId
      };
    }
  }

  private async executeGmail(input: any, apiKeys: Record<string, string>): Promise<IntegrationResult> {
    const { deliverable } = input.result || {};
    
    if (!deliverable) {
      throw new Error('No email content provided');
    }

    const gmailEmail = apiKeys.gmail_email;
    const gmailPassword = apiKeys.gmail_app_password;

    if (!gmailEmail || !gmailPassword) {
      throw new Error('Gmail credentials missing. Need gmail_email and gmail_app_password');
    }

    // Extract email details from deliverable (AI-generated content)
    const emailData = this.parseEmailContent(deliverable);
    
    logger.info(`📧 Sending real email via Gmail: ${gmailEmail}`);

    try {
      // Create nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailEmail,
          pass: gmailPassword
        }
      });

      // Verify connection
      await transporter.verify();
      logger.info('✅ Gmail SMTP connection verified');

      // Send email
      const mailOptions = {
        from: gmailEmail,
        to: emailData.to.join(', '),
        subject: emailData.subject,
        text: emailData.textBody,
        html: emailData.htmlBody
      };

      const result = await transporter.sendMail(mailOptions);
      
      logger.info(`✅ Email sent successfully! Message ID: ${result.messageId}`);

      return {
        success: true,
        data: {
          messageId: result.messageId,
          to: emailData.to,
          subject: emailData.subject,
          sent: true,
          provider: 'Gmail SMTP',
          timestamp: new Date()
        },
        timestamp: new Date(),
        integration: 'gmail'
      };

    } catch (error: any) {
      logger.error('❌ Gmail sending failed:', error.message);
      
      // Provide helpful error messages based on common issues
      if (error.message.includes('Invalid login') || error.message.includes('BadCredentials')) {
        throw new Error('Gmail login failed. Please check:\n• You\'re using a Gmail App Password (not your regular password)\n• App Password is 16 characters with no spaces\n• 2-Step Verification is enabled on your Gmail account\n• You\'re using the correct Gmail address');
      } else if (error.message.includes('Less secure app')) {
        throw new Error('Gmail security settings issue. Please:\n• Enable 2-Step Verification\n• Create an App Password instead of using your regular password');
      } else {
        throw new Error(`Gmail connection failed: ${error.message}`);
      }
    }
  }

  private async executeLinkedIn(input: any, apiKeys: Record<string, string>): Promise<IntegrationResult> {
    const { deliverable } = input.result || {};
    
    if (!deliverable) {
      throw new Error('No LinkedIn content provided');
    }

    // Extract post content
    const postContent = this.parseLinkedInContent(deliverable);
    
    // Simulate LinkedIn API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        postId: `linkedin_${Date.now()}`,
        content: postContent.text,
        published: true,
        visibility: 'PUBLIC',
        timestamp: new Date()
      },
      timestamp: new Date(),
      integration: 'linkedin'
    };
  }

  private async executeFacebook(input: any, apiKeys: Record<string, string>): Promise<IntegrationResult> {
    const { deliverable } = input.result || {};
    
    if (!deliverable) {
      throw new Error('No Facebook content provided');
    }

    // Extract post content
    const postContent = this.parseFacebookContent(deliverable);
    
    // Simulate Facebook API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        postId: `facebook_${Date.now()}`,
        message: postContent.text,
        published: true,
        timestamp: new Date()
      },
      timestamp: new Date(),
      integration: 'facebook'
    };
  }

  private async executeTwitter(input: any, apiKeys: Record<string, string>): Promise<IntegrationResult> {
    const { deliverable } = input.result || {};
    
    if (!deliverable) {
      throw new Error('No Twitter content provided');
    }

    // Extract tweet content
    const tweetContent = this.parseTwitterContent(deliverable);
    
    // Simulate Twitter API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        tweetId: `twitter_${Date.now()}`,
        text: tweetContent.text,
        published: true,
        timestamp: new Date()
      },
      timestamp: new Date(),
      integration: 'twitter'
    };
  }

  private async executeStripe(input: any, apiKeys: Record<string, string>): Promise<IntegrationResult> {
    const { deliverable } = input.result || {};
    
    if (!deliverable) {
      throw new Error('No product data provided');
    }

    // Extract product information
    const productData = this.parseProductContent(deliverable);
    
    // Simulate Stripe API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        productId: `prod_${Date.now()}`,
        priceId: `price_${Date.now()}`,
        name: productData.name,
        price: productData.price,
        created: true,
        timestamp: new Date()
      },
      timestamp: new Date(),
      integration: 'stripe'
    };
  }

  private async executeHubSpot(input: any, apiKeys: Record<string, string>): Promise<IntegrationResult> {
    const { deliverable } = input.result || {};
    
    if (!deliverable) {
      throw new Error('No HubSpot data provided');
    }

    // Extract contact/lead information
    const leadData = this.parseLeadContent(deliverable);
    
    // Simulate HubSpot API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        contactId: `hubspot_${Date.now()}`,
        email: leadData.email,
        created: true,
        timestamp: new Date()
      },
      timestamp: new Date(),
      integration: 'hubspot'
    };
  }

  private async executeWordPress(input: any, apiKeys: Record<string, string>): Promise<IntegrationResult> {
    const { deliverable } = input.result || {};
    
    if (!deliverable) {
      throw new Error('No blog content provided');
    }

    // Extract blog post data
    const blogData = this.parseBlogContent(deliverable);
    
    // Simulate WordPress API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        postId: `wp_${Date.now()}`,
        title: blogData.title,
        status: 'published',
        url: `${apiKeys.wordpress_url}/${blogData.slug}`,
        timestamp: new Date()
      },
      timestamp: new Date(),
      integration: 'wordpress'
    };
  }

  // Content parsing methods - Enhanced for real email sending
  private parseEmailContent(content: string): any {
    // Parse AI-generated content for email elements
    const lines = content.split('\n').filter(line => line.trim());
    
    let subject = 'AI Generated Email Campaign';
    let recipients = ['test@example.com']; // Default - will be overridden by user
    let textBody = content;
    let htmlBody = this.convertToHtml(content);

    // Extract subject if AI provided one
    const subjectMatch = content.match(/Subject:\s*(.+)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
    }

    // Look for email addresses in content (recipients)
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const foundEmails = content.match(emailRegex);
    if (foundEmails && foundEmails.length > 0) {
      recipients = foundEmails;
    }

    // Clean up text body (remove subject line if it was extracted)
    if (subjectMatch) {
      textBody = content.replace(subjectMatch[0], '').trim();
      htmlBody = this.convertToHtml(textBody);
    }

    return {
      to: recipients,
      subject: subject,
      textBody: textBody,
      htmlBody: htmlBody
    };
  }

  private convertToHtml(text: string): string {
    // Convert plain text to HTML with basic formatting
    return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
          ${text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>')}
        </div>
        <footer style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>Sent by your AI Email Campaign Agent</p>
          <p>Powered by Barakah AI Agents</p>
        </footer>
      </body>
    </html>`;
  }

  private parseLinkedInContent(content: string): any {
    return { text: content.substring(0, 1300) }; // LinkedIn limit
  }

  private parseFacebookContent(content: string): any {
    return { text: content.substring(0, 2000) }; // Facebook limit
  }

  private parseTwitterContent(content: string): any {
    return { text: content.substring(0, 280) }; // Twitter limit
  }

  private parseProductContent(content: string): any {
    return {
      name: 'Generated Product',
      price: 1999, // $19.99
      description: content
    };
  }

  private parseLeadContent(content: string): any {
    return {
      email: 'lead@example.com',
      name: 'Generated Lead',
      notes: content
    };
  }

  private parseBlogContent(content: string): any {
    const lines = content.split('\\n');
    return {
      title: lines[0] || 'Generated Blog Post',
      content: content,
      slug: 'generated-blog-post'
    };
  }

  getIntegration(id: string): IntegrationConfig | undefined {
    return this.integrations.get(id);
  }

  getAllIntegrations(): IntegrationConfig[] {
    return Array.from(this.integrations.values());
  }
}