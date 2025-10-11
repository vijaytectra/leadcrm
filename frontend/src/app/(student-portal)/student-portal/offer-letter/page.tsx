import { Metadata } from 'next';
import OfferLetterViewer from '@/components/student-portal/OfferLetterViewer';

export const metadata: Metadata = {
    title: 'Offer Letter',
    description: 'View and manage your offer letter',
};

export default function OfferLetterPage() {
    return <OfferLetterViewer />;
}
