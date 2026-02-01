import { FC } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';

import { ButtonGroup } from '../ui/button-group';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type FontStepperProps = {
  value: number;
  onChange: (value: number) => void;
}

const FontSizeStepper: FC<FontStepperProps> = ({ value, onChange }) => {
  function updateDelta(e: React.MouseEvent, newDelta: number): void {
    e.preventDefault();
    onChange(newDelta);
  }

  return (
    <ButtonGroup>
      <Button onClick={(e) => updateDelta(e, value - 1)}>
        <MinusIcon />
      </Button>
      <Input
        name="delta"
        value={value >= 0 ? '+' + value : value}
        readOnly
        className="w-16 text-center border-none shadow-none"
      />
      <Button onClick={(e) => updateDelta(e, value + 1)}>
        <PlusIcon />
      </Button>
    </ButtonGroup>
  );
}

export default FontSizeStepper;
