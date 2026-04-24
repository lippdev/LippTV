const logoUrl = new URL("../../../assets/logo.png", import.meta.url).href;

type Props = {
  className?: string;
};

export function BrandLogo({ className }: Props) {
  return <img className={`brand-logo ${className ?? ""}`.trim()} src={logoUrl} alt="LippTV" />;
}
