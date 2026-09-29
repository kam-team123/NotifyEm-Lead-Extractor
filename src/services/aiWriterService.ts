import { CampaignDraft, CampaignType } from '../types';

export interface GenerateDraftRequest {
  campaignType: CampaignType;
  targetAudience: string;
  focusContext: string;
  featuredPropertyTitle?: string;
  featuredPropertyPrice?: number;
  featuredCityState?: string;
  tone: 'Professional & Authoritative' | 'Concise & High-Touch' | 'Investor-Focused' | 'Neighborly & Warm';
  includeComplianceFooter: boolean;
}

export async function generateAICampaignDraft(req: GenerateDraftRequest): Promise<{
  title: string;
  subject: string;
  bodyContent: string;
}> {
  // Simulate AI generation latency
  await new Promise(r => setTimeout(r, 700));

  let subject = '';
  let bodyContent = '';
  let title = '';

  const propertyLine = req.featuredPropertyTitle 
    ? `\nFeatured Acquisition: ${req.featuredPropertyTitle} in ${req.featuredCityState || 'Prime Location'} (${req.featuredPropertyPrice ? `$${req.featuredPropertyPrice.toLocaleString()}` : 'Price on request'})\n`
    : '';

  switch (req.campaignType) {
    case 'Monday Newsletter':
      title = `Monday Market Pulse: ${req.featuredCityState || 'National'} Real Estate Watch`;
      subject = `Market Brief: Key weekly trends, mortgage rates & private listings for {{Lead.FirstName}}`;
      bodyContent = `Good morning {{Lead.FirstName}},

Here is your weekly intelligence brief on current residential and commercial property movements:

1. Macro Trends: ${req.focusContext || 'Active inventory continues to expand across major Sunbelt and West Coast hubs, offering favorable terms for well-capitalized buyers.'}
${propertyLine}
2. Interest Rate Advisory: Current 30-year conforming rates remain steady, with private lending desks offering competitive portfolio loan options for multi-family assets.
3. Buyer Sentiment: Relocation velocity between corporate centers remains strong through the quarter.

Would you like an updated comparative market analysis for your target zip codes this week? Reply directly to this email.

Warm regards,
Alex Mercer | Principal Broker
Notifyem Real Estate Advisory
Lic #RE-882194`;
      break;

    case 'Wednesday Market Education':
      title = `Wednesday Advisory: Strategic Guidance on ${req.focusContext.slice(0, 40) || 'Real Estate Wealth'}`;
      subject = `Strategic Guide: ${req.focusContext.slice(0, 50) || 'Maximizing Real Estate Equity & Tax Advantages'}`;
      bodyContent = `Hello {{Lead.FirstName}},

Every Wednesday we share tactical insights for property owners, brokers, and real estate investors.

Key Principles to Consider:
- ${req.focusContext || '1031 Exchange Timelines: Lock in your replacement property identification within 45 days.'}
- Capital Preservation: Structuring acquisitions to mitigate debt risk while protecting depreciation deductions.
- Asset Positioning: Professional staging and high-definition architectural photography increase buyer inquiries by over 38%.
${propertyLine}
If you are evaluating portfolio changes this quarter, our team is available for a confidential scenario review.

Sincerely,
The Notifyem Strategic Advisory Desk`;
      break;

    case 'Friday Property Highlights':
      title = `Friday Showcase: Exclusive Weekend Property Dropped on MLS`;
      subject = `Weekend Preview: New Property Listing Drop across America`;
      bodyContent = `Happy Friday {{Lead.FirstName}},

Every Friday we curate the most compelling new listings across our nationwide partner network:
${propertyLine}
Property Highlights & Key Details:
- Location & Setting: Prime access to premier schools, cultural centers, and executive corridors.
- Distinctive Architecture: Custom finishes, energy-efficient mechanicals, and private outdoor grounds.
- Inspection & Disclosures: Full inspection packet, title report, and seller disclosures are available upon request.

Private showing windows are open this Saturday and Sunday. Reply to reserve your dedicated appointment time.

Best regards,
Notifyem Premier Listings Team`;
      break;

    case 'Direct Agent Outreach':
      title = `Direct Outreach: Referral & Co-Broker Opportunity`;
      subject = `Connecting regarding real estate opportunities in {{Lead.City}}`;
      bodyContent = `Hi {{Lead.FirstName}},

I noticed your active presence in the {{Lead.City}} real estate market and wanted to reach out directly regarding potential co-brokering and client referral synergies.
${propertyLine}
${req.focusContext || 'We have qualified buyers actively seeking properties in your market and are seeking trusted local brokerage partners.'}

Do you have 10 minutes next Tuesday or Wednesday for a brief introductory call?

Best regards,
Alex Mercer
Notifyem Partner Network`;
      break;
  }

  if (req.includeComplianceFooter) {
    bodyContent += `\n\n----------------------------------------\nEqual Housing Opportunity. All information deemed reliable but not guaranteed. If you wish to unsubscribe or update your contact preferences, please reply with "UNSUBSCRIBE" or click to manage preferences. Registered Brokerage: Notifyem Advisory, 500 Congress Ave, Suite 1400, Austin, TX 78701.`;
  }

  return { title, subject, bodyContent };
}
