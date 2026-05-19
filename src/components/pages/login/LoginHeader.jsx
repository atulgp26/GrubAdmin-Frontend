import Icon from "@/components/ui/Icon";
import Image from "next/image";
import Link from "next/link";
import Button from "../../ui/Button";

export default function LoginHeader() {
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-white border-b border-[var(--color-neutral-secondary-bg)]">
      <div>
        <Link href="/">
        <Image src="/Login-mark.svg" width={56} height={56} alt="login-mark" />
        </Link>
      </div>
      <Button
        as="a"
        href="#"
        rel="noopener noreferrer"
        variant="grayOutline"
        size="sm"
        className="text-sm px-4 py-1.5 rounded-lg font-medium transition"
      >
        VISIT WEBSITE
      </Button>
    </header>
  );
} 