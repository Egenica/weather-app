import { Button } from '../ui/button';

export const MiniNav = () => {
  return (
    <>
      <nav className="flex flex-row items-center justify-between p-2 pl-3">
        <Button variant={'link'} className="text-sm font-normal text-white opacity-50 hover:opacity-100">
          Change Location
        </Button>
      </nav>
    </>
  );
};
