import { Metadata } from 'next';
import BulkOfferGenerator from '@/components/admission-head/BulkOfferGenerator';

export const metadata: Metadata = {
    title: 'Bulk Offer Generation',
    description: 'Generate and send bulk offer letters',
};

export default function BulkOffersPage() {
    return <BulkOfferGenerator />;
}
