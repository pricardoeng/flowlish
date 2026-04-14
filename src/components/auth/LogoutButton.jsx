"use client"
import React from 'react';
import { signOut } from "next-auth/react";
import Button from '@/components/ui/Button';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const LogoutButton = ({ className, variant = "outline", showIcon = true }) => {
  return (
    <Button 
      variant={variant}
      className={cn("gap-2", className)}
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      {showIcon && <LogOut size={18} />}
      Sair da Conta
    </Button>
  );
};

export default LogoutButton;
