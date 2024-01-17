'use client';

import { Button } from '@/components/ui/button';

export const ButtonClient = () => {
  return (
    <>
      <Button
        onClick={() => {
          console.log('clicked');
        }}
      >
        Button
      </Button>
    </>
  );
};
