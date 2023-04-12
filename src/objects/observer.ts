
/* IMPORT */

import {DIRTY_NO, DIRTY_MAYBE_NO, DIRTY_MAYBE_YES, DIRTY_YES, DIRTY_DISPOSED} from '~/constants';
import {OWNER, SUPER_OWNER} from '~/context';
import {lazyArrayPush} from '~/lazy';
import {ObservablesArray, ObservablesSet} from '~/objects/observables';
import Owner from '~/objects/owner';
import type {IOwner, ObserverFunction, Signal} from '~/types';

/* MAIN */

class Observer extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  signal: Signal = OWNER.signal;
  status: number = DIRTY_YES;
  observables: ObservablesArray | ObservablesSet;
  sync?: boolean;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    this.observables = new ObservablesArray ( this );

    if ( OWNER !== SUPER_OWNER ) {

      lazyArrayPush ( this.parent, 'observers', this );

    }

  }

  /* API */

  dispose ( shallow?: boolean ): void {

    this.status = shallow ? this.status : DIRTY_DISPOSED;
    this.observables.dispose ( shallow );

    super.dispose ();

  }

  refresh <T> ( fn: ObserverFunction<T> ): T {

    this.dispose ( true );

    this.status = DIRTY_MAYBE_NO; // Resetting the trip flag, we didn't re-execute just yet

    try {

      return this.wrap ( fn, this, this );

    } finally {

      this.observables.postdispose ();

    }

  }

  run (): void {

    throw new Error ( 'Abstract method' );

  }

  stale ( status: number ): void {

    throw new Error ( 'Abstract method' );

  }

  update (): void {

    if ( this.signal.disposed ) return; // Disposed, it shouldn't be updated again

    if ( this.status === DIRTY_DISPOSED ) return; // Disposed, it shouldn't be updated again

    if ( this.status === DIRTY_MAYBE_YES ) { // Maybe we are dirty, let's check with our observables, to be sure

      this.observables.update ();

    }

    if ( this.status === DIRTY_YES ) { // We are dirty, let's refresh

      this.status = DIRTY_MAYBE_NO; // Trip flag, to be able to tell if we caused ourselves to be dirty again

      this.run ();

      if ( this.status === DIRTY_MAYBE_NO ) { // Not dirty anymore

        this.status = DIRTY_NO;

      } else { // Maybe we are still dirty, let's check again

        this.update ();

      }

    } else { // Not dirty

      this.status = DIRTY_NO;

    }

  }

}

/* EXPORT */

export default Observer;
