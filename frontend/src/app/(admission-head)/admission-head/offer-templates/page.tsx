import { Metadata } from 'next';
import OfferLetterTemplateBuilder from '@/components/admission-head/OfferLetterTemplateBuilder';

export const metadata: Metadata = {
    title: 'Offer Letter Templates',
    description: 'Create and manage offer letter templates',
};

export default function OfferTemplatesPage() {
    return <OfferLetterTemplateBuilder />;
}
