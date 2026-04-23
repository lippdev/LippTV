import logoUrl from "../assets/LippTV.png";

type Props = {
  className?: string;
};

export function BrandLogo({ className }: Props) {
  return <img className={`brand-logo ${className ?? ""}`.trim()} src={logoUrl} alt="LippTV" />;
}
