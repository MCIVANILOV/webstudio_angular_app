import {Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, Validators} from "@angular/forms";
import {NewUserRequestType} from "../../../../types/new-user-request.type";
import {Router} from "@angular/router";
import {OrderService} from "../../services/order.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {OrderType} from "../../../../types/order.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {ScrollService} from "../../services/scroll.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  activeSection: string = '';
  private destroy$ = new Subject<void>();

  orderCallForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    type: [NewUserRequestType.consultation, Validators.required]
  })

  @ViewChild('popup_call') popup!: TemplateRef<ElementRef>
  @ViewChild('popup_success') popup_complete!: TemplateRef<ElementRef>
  dialogRef: MatDialogRef<any> | null = null;
  dialogRefSuccess: MatDialogRef<any> | null = null;

  constructor(private router: Router,
              private orderService: OrderService,
              private dialog: MatDialog,
              private fb: FormBuilder,
              private _snackBar: MatSnackBar,
              private scrollService: ScrollService) { }

  ngOnInit(): void {
    this.scrollService.activeSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        this.activeSection = section;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createCallOrder() {
    if (this.orderCallForm.valid && this.orderCallForm.value.name && this.orderCallForm.value.phone
      && this.orderCallForm.value.type) {

      const paramsObject: OrderType = {
        name: this.orderCallForm.value.name,
        phone: this.orderCallForm.value.phone,
        type: this.orderCallForm.value.type,
      };

      this.orderService.createOrder(paramsObject)
        .subscribe({
          next: (data: OrderType | DefaultResponseType) => {
            if ((data as DefaultResponseType).error) {
              throw new Error((data as DefaultResponseType).message);
            }

            this.closePopup();
            this.dialogRefSuccess = this.dialog.open(this.popup_complete);
            this.dialogRefSuccess?.afterClosed().subscribe(() => {
              this.orderCallForm.reset();
            });
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка заказа');
            }
          }
        });
    } else {
      this.orderCallForm.markAllAsTouched();
      this._snackBar.open('Заполните необходимые поля');
    }
  }

  callService() {
    this.openModal();
  }

  openModal() {
    this.dialogRef = this.dialog.open(this.popup);
  }

  closePopup() {
    this.dialogRef?.close();
    this.orderCallForm.reset();
    this.router.navigate(['/']);
  }

  closePopupSuccess() {
    this.dialogRefSuccess?.close();
    this.router.navigate(['/']);
  }

  goToSection(section: string): void {
    this.scrollService.scrollTo(section);
  }

  isCatalogActive(): boolean {
    return this.scrollService.isCatalogActive();
  }
}
