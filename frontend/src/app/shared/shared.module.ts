import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ArticleCardComponent} from "./components/article-card/article-card.component";
import {RouterModule} from "@angular/router";
import { BackToTopComponent } from './components/back-to-top/back-to-top.component';



@NgModule({
  declarations: [ArticleCardComponent, BackToTopComponent],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [ArticleCardComponent, BackToTopComponent]
})
export class SharedModule { }
