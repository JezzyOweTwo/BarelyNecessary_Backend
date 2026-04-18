import Image from "next/image";

export default function TestPage() {
  return (
    <main>
      <Image
        src="/api/images/4"
        alt="Product 4"
        width={400}
        height={400}
        unoptimized
      />
    </main>
  );
}
