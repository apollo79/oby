
/* MAIN */

type IContext<TI = unknown> = IListener<TI>;

type IDisposer = () => void;

type IListener<TI = unknown> = ( value: TI, valuePrev: TI | undefined ) => void;

type IObservableAbstract<T = unknown, TI = unknown> = {
  (): TI,
  ( value: Exclude<T, Function> | (( valuePrev: TI ) => T) ): T,
  get (): TI,
  set ( value: T ): T,
  on ( listener: IListener<TI>, immediate?: boolean ): void,
  off ( listener: IListener<TI> ): void,
  dispose (): void
};

type IObservableWithoutInitial<T = unknown> = IObservableAbstract<T, T | undefined>;

type IObservable<T = unknown> = IObservableAbstract<T, T>;

/* EXPORT */

export {IContext, IDisposer, IListener, IObservableWithoutInitial, IObservable};
