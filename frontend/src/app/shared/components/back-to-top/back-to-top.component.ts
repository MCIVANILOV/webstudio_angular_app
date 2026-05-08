import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {ScrollService} from "../../services/scroll.service";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'back-to-top',
  templateUrl: './back-to-top.component.html',
  styleUrls: ['./back-to-top.component.scss']
})

export class BackToTopComponent implements OnInit, OnDestroy {
  showBackToTop: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(public scrollService: ScrollService) {}

  ngOnInit(): void {
    this.scrollService.showBackToTop$
      .pipe(takeUntil(this.destroy$))
      .subscribe(show => {
        this.showBackToTop = show;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
