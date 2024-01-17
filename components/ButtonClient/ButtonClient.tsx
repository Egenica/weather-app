'use client';

import { Button } from '@/components/ui/button';

export const ButtonClient = () => {
  return (
    <>
      <Button
        variant={'outline'}
        onClick={() => {
          console.log('clicked');
        }}
      >
        Button
      </Button>
    </>
  );
};
