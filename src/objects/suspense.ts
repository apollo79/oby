
/* IMPORT */

import {OWNER, SUSPENSE} from '~/constants';
import Effect from '~/objects/effect';
import Observer from '~/objects/observer';
import type {IObserver, SuspenseFunction, LazyArray} from '~/types';

/* MAIN */

class Suspense extends Observer {

  /* VARIABLES */

  suspended: number = SUSPENSE.current?.suspended || 0; // 0: UNSUSPENDED, 1: THIS_SUSPENDED, 2+: THIS_AND_PARENT_SUSPENDED

  /* CONSTRUCTOR */

  constructor () {

    super ();

    OWNER.current.registerObserver ( this );

  }

  /* API */

  toggle ( force: boolean ): void {

    if ( !this.suspended && !force ) return; // Already suspended, this can happen at instantion time

    const suspendedPrev = this.suspended;

    this.suspended += force ? 1 : -1;

    if ( suspendedPrev >= 2 ) return; // No pausing or resuming

    /* NOTIFYING EFFECTS AND SUSPENSES */

    const notifyObservers = ( observers: LazyArray<IObserver>, cb: Function ): void => {
      if ( observers instanceof Array ) {
        for ( let i = 0, l = observers.length; i < l; i++ ) {
          cb ( observers[i] );
        }
      } else if ( observers ) {
        cb ( observers );
      }
    };

    const notifyObserver = ( observer: IObserver ): void => {
      if ( observer instanceof Suspense ) return;
      if ( observer instanceof Effect ) {
        if ( force ) {
          observer.stale ( false );
        } else {
          observer.unstale ( false );
        }
      }
      notifyObservers ( observer.observers, notifyObserver );
    };

    const notifySuspense = ( observer: IObserver ): void => {
      if ( !( observer instanceof Suspense ) ) return;
      observer.toggle ( force );
    };

    notifyObservers ( this.observers, notifyObserver );
    notifyObservers ( this.observers, notifySuspense );

  }

  wrap <T> ( fn: SuspenseFunction<T> ): T {

    const suspensePrev = SUSPENSE.current;

    SUSPENSE.current = this;

    try {

      return super.wrap ( fn );

    } finally {

      SUSPENSE.current = suspensePrev;

    }

  }

}

/* EXPORT */

export default Suspense;