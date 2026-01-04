import { InnerFooter } from "../../components/InnerFooter";

export default function InnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InnerFooter />
    </>
  );
}
