import { useRouter } from "next/router";
import Link from "next/link";

export default function ErrorPage() {
  const router = useRouter();
  const { code, message } = router.query; // retrieve error info from URL

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f8f8",
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "5rem", color: "#ff4d4f" }}>
        {code || 500}
      </h1>
      <h2 style={{ marginTop: "1rem", fontSize: "2rem" }}>
        {message || "Something went wrong."}
      </h2>
      <p style={{ marginTop: "1rem", color: "#666" }}>
        Please try again or return to the home page.
      </p>
      <Link
        href="/"
        style={{
          marginTop: "2rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#1890ff",
          color: "white",
          borderRadius: "0.5rem",
          textDecoration: "none",
        }}
      >
        Go Home
      </Link>
    </div>
  );
}