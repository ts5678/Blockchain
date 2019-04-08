import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { ConfigureItemComponent } from './configure-item/configure-item.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { PlanningDashboardComponent } from './planning-dashboard/planning-dashboard.component';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxMaskModule } from 'ngx-mask';
import { SlicePipe } from '@angular/common';

import { InfoShareService } from './infoshare.service';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    ConfigureItemComponent,
    FetchDataComponent,
    PlanningDashboardComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    HttpModule,
    NgxLoadingModule.forRoot({}),
    NgxDatatableModule,
    NgxMaskModule.forRoot(),
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'configure-item', component: ConfigureItemComponent },
      { path: 'fetch-data', component: FetchDataComponent },
      { path: 'planning-dashboard', component: PlanningDashboardComponent },
    ])
  ],
  providers: [InfoShareService],
  bootstrap: [AppComponent]
})
export class AppModule { }
