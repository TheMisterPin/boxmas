"use client"

import React from 'react';
import { UniversalModal } from '@/components/universal-modal';
import { CreateUserForm } from '../forms/create-user-form';
import { Plus } from 'lucide-react';

export default function CreateUserModal() {
  return (
    <UniversalModal
      buttonConfig={{
        type: 'full',
        text: 'Add User',
        icon: Plus,
        onClick: () => {},
        variant: 'outline',
      }}
      title="Create User"
    >
      <CreateUserForm />
    </UniversalModal>
  );
}
