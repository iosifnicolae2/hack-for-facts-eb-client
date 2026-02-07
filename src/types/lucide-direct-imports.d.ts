declare module 'lucide-react/dist/esm/icons/*' {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

  type LucideIcon = ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, 'ref'> & {
      size?: string | number;
      absoluteStrokeWidth?: boolean;
    } & RefAttributes<SVGSVGElement>
  >;

  const icon: LucideIcon;
  export default icon;
}
