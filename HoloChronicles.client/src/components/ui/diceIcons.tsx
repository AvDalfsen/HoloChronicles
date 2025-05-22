import D6 from '@/assets/swrpg-icons/SVG/d6.svg?react';
import D8 from '@/assets/swrpg-icons/SVG/d8.svg?react';
import D12 from '@/assets/swrpg-icons/SVG/d12.svg?react';
import Success from '@/assets/swrpg-icons/SVG/swrpg-success.svg?react';
import Failure from '@/assets/swrpg-icons/SVG/swrpg-failure.svg?react';
import Advantage from '@/assets/swrpg-icons/SVG/swrpg-advantage.svg?react';
import Threat from '@/assets/swrpg-icons/SVG/swrpg-threat.svg?react';
import Triumph from '@/assets/swrpg-icons/SVG/swrpg-triumph.svg?react';
import Despair from '@/assets/swrpg-icons/SVG/swrpg-despair.svg?react';

type IconProps = {
    SvgIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    fill?: string;
    size?: number;
};

const Icon = ({ SvgIcon, fill, size = 24 }: IconProps) => {
    const style: React.CSSProperties = {
        fill,
        stroke: 'black',
        strokeWidth: 1,
        width: size,
        height: size,
        display: 'inline-block',
        verticalAlign: 'text-bottom',
        margin: '0 2px',
    };
    return <SvgIcon style={style} />;
};

export function boostIcon() {
    return <Icon SvgIcon={D6} fill="#A0D9F5" />;
}

export function setbackIcon() {
    return <Icon SvgIcon={D6} fill="#000000" />;
}

export function abilityIcon() {
    return <Icon SvgIcon={D8} fill="#52B849" />;
}

export function proficiencyIcon() {
    return <Icon SvgIcon={D12} fill="#FEE800" />;
}

export function difficultyIcon() {
    return <Icon SvgIcon={D8} fill="#532380" />;
}

export function successIcon() {
    return <Icon SvgIcon={Success} />;
}

export function failureIcon() {
    return <Icon SvgIcon={Failure} />;
}

export function advantageIcon() {
    return <Icon SvgIcon={Advantage} />;
}

export function threatIcon() {
    return <Icon SvgIcon={Threat} />;
}

export function triumphIcon() {
    return <Icon SvgIcon={Triumph} />;
}

export function despairIcon() {
    return <Icon SvgIcon={Despair} />;
}
