interface Props {
  ligado: boolean;
  rotulo: string;
  desabilitado?: boolean;
  onAlternar: () => void;
}

export function Switch({ ligado, rotulo, desabilitado, onAlternar }: Props) {
  return (
    <button
      type="button"
      className="switch"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      disabled={desabilitado}
      onClick={onAlternar}
    />
  );
}
