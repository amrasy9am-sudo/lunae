import { Suspense } from "react";
import { Login } from "@/components/account/login";

export default function LoginPage() {
  return (
    <div className="container-lux">
      <Suspense fallback={<div className="skeleton my-12 h-96" />}>
        <Login />
      </Suspense>
    </div>
  );
}
