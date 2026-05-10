import type { Metadata } from 'next';
import DesignerClient from './DesignerClient';

export const metadata: Metadata = {
  title: 'Customize — AcrylixCo',
  description: 'Design your own multi-layered acrylic piece.',
};

export default function CustomizePage() {
  return <DesignerClient />;
}
