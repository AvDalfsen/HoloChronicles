import D6 from '@/assets/swrpg-icons/SVG/d6.svg?react';
import D8 from '@/assets/swrpg-icons/SVG/d8.svg?react';
import D12 from '@/assets/swrpg-icons/SVG/d12.svg?react';

export function boostIcon() {
    return (
        <span style={{ display: 'flex'}}>
            <Icon SvgIcon={D6} fill="#A0D9F5" />
        </span>
    );
}

export function setbackIcon() {
    return (
        <span style={{ display: 'flex' }}>
            <Icon SvgIcon={D6} fill="#000000" />
        </span>
    );
}

export function abilityIcon() {
    return (
        <span style={{ display: 'flex' }}>
            <Icon SvgIcon={D8} fill="#52B849" />
        </span>
    );
}

export function proficiencyIcon() {
    return (
        <span style={{ display: 'flex' }}>
            <Icon SvgIcon={D12} fill="#FEE800" />
        </span>
    );
}

type IconProps = {
    SvgIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>; // Accepts an SVG component
    fill: string;
    size?: number;
};

const Icon = ({ SvgIcon, fill, size = 24 }: IconProps) => {
    const style = { fill, stroke: 'black', strokeWidth: 1, width: size, height: size };
    return <SvgIcon style={style} />;
};