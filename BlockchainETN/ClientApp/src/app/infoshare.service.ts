import { Injectable, Output, EventEmitter } from '@angular/core'
import * as libs from './shared-library';


@Injectable()
export class InfoShareService {

  public Customer: libs.CustomerInfo | null;
}
