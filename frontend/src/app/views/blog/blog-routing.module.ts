import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CatalogComponent} from "./catalog/catalog.component";
import {ArticleComponent} from "./article/article.component";

const routes: Routes = [
  {path: 'catalog', component: CatalogComponent},
  {path: 'articles/:url', component: ArticleComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }
