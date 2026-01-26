"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterForm() {
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호 길이 확인
    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ email, username, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border-l-4 border-error-500 bg-error-500/10 px-3 py-2 text-sm text-error-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-neutral-700">
          이메일
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting || isLoading}
          placeholder="user@example.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-neutral-700">
          사용자명
        </label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={20}
          disabled={isSubmitting || isLoading}
          placeholder="username"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-neutral-700">
          비밀번호
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          disabled={isSubmitting || isLoading}
          placeholder="••••••••"
        />
        <p className="text-xs text-neutral-500">최소 8자 이상</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">
          비밀번호 확인
        </label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isSubmitting || isLoading}
          placeholder="••••••••"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        loading={isSubmitting || isLoading}
        disabled={isSubmitting || isLoading}
      >
        회원가입
      </Button>
    </form>
  );
}
