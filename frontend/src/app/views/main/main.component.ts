import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ArticleType} from "../../../types/article.type";
import {ArticleService} from "../../shared/services/article.service";
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, Validators} from "@angular/forms";
import {NewUserRequestType} from "../../../types/new-user-request.type";
import {OrderType} from "../../../types/order.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DefaultResponseType} from "../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {Router} from "@angular/router";
import {OrderService} from "../../shared/services/order.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  articles: ArticleType[] = [];

  customOptionsOffers: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    margin: 26,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    autoplay: true,           // Включить авто-прокрутку
    autoplayTimeout: 3000,    // Интервал между прокрутками (в мс)
    autoplayHoverPause: true, // Пауза при наведении мыши
    autoplaySpeed: 800,       // Скорость анимации прокрутки (опционально)
    smartSpeed: 700,          // Умная скорость (опционально)
    responsive: {
      0: { items: 1 },
      600: { items: 1 },
      1000: { items: 1 }
    },
    nav: false
  }

  offers = [
    {
      type: 'Предложение месяца',
      title: 'Продвижение в Instagram для вашего бизнеса <span class="highlight">-15%</span>!',
      image: 'banner-1.png',
      serviceTitle: 'Создание сайтов'
    },
    {
      type: 'Акция',
      title: 'Нужен грамотный <span class="highlight">копирайтер</span>?',
      description: 'Весь декабрь у нас действует акция на работу копирайтер.',
      image: 'banner-2.png',
      serviceTitle: 'Копирайтинг'
    },
    {
      type: 'Новость дня',
      title: '<span class="highlight">6 место</span> в ТОП-10 <br> SMM-агенств Москвы!',
      description: 'Мы благодарим каждого, кто голосовал за нас!',
      image: 'banner-3.png',
      serviceTitle: 'Реклама'
    },
  ]

  customOptionsReviews: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 26,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      }
    },
    nav: false
  }

  reviews = [
    {
      name: 'Станислав',
      image: 'review1.png',
      text: 'Спасибо огромное АйтиШторму за прекрасный блог с полезными статьями! Именно они и побудили меня углубиться в тему SMM и начать свою карьеру.'
    },
    {
      name: 'Алёна',
      image: 'review2.png',
      text: 'Обратилась в АйтиШторм за помощью копирайтера. Ни разу ещё не пожалела! Ребята действительно вкладывают душу в то, что делают, и каждый текст, который я получаю, с нетерпением хочется выложить в сеть.'
    },
    {
      name: 'Мария',
      image: 'review3.png',
      text: 'Команда АйтиШторма за такой короткий промежуток времени сделала невозможное: от простой фирмы по услуге продвижения выросла в мощный блог о важности личного бренда. Класс!'
    },
    {
      name: 'Марк',
      image: 'review4.jpg',
      text: 'Первый раз заказывал у них создание сайта — всё устроило. Работа выполнена в срок, всё понятно и на высоте.'
    },
    {
      name: 'Ангелина',
      image: 'review5.jpeg',
      text: 'Обратилась в АйтиШторм за созданием сайта — результат меня удивил! Всё сделали быстро и красиво, очень довольна.'
    },
    {
      name: 'Марина',
      image: 'review6.jpg',
      text: 'За копирайтинг и рекламу — команда профессионалов. Всё ясно и качественно, почувствовала поддержку и вдохновение.'
    },
  ]

  orderForm = this.fb.group({
    service: ['', Validators.required],
    name: ['', Validators.required],
    phone: ['', Validators.required],
    type: [NewUserRequestType.order, Validators.required]
  })

  @ViewChild('popup_order') popup!: TemplateRef<ElementRef>
  @ViewChild('popup_success') popup_complete!: TemplateRef<ElementRef>
  dialogRef: MatDialogRef<any> | null = null;
  dialogRefSuccess: MatDialogRef<any> | null = null;
  selectedService: string = '';

  constructor(private articleService: ArticleService,
              private router: Router,
              private orderService: OrderService,
              private dialog: MatDialog,
              private fb: FormBuilder,
              private _snackBar: MatSnackBar,) {
  }

  ngOnInit(): void {
    this.articleService.getPopularArticles()
      .subscribe((data: ArticleType[]) => {
        this.articles = data;
      })
  }

  openModal() {
    this.dialogRef = this.dialog.open(this.popup);
  }

  // Этот метод вызывается из шаблона (если <select> используется отдельно)
  onServiceChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.setServiceValue(target.value); // Вызываем общий метод
  }

  // Этот метод вызывается из submitAnApplication
  setServiceValue(value: string) {
    this.orderForm.get('service')?.setValue(value);
    this.selectedService = value;
  }

  submitAnApplication(serviceKey: string) {
    this.openModal();

    // Используем карту соответствий, как в selectService
    const mapping: { [key: string]: string } = {
      'Создание сайтов': 'develop',
      'Копирайтинг': 'copywriting',
      'Продвижение': 'smm',
      'Реклама': 'advt'
    };

    const value = mapping[serviceKey] || '';

    this.setServiceValue(value);
  }

  createOrder() {
    if (this.orderForm.valid && this.orderForm.value.service && this.orderForm.value.name && this.orderForm.value.phone
      && this.orderForm.value.type) {

      const paramsObject: OrderType = {
        service: this.orderForm.value.service,
        name: this.orderForm.value.name,
        phone: this.orderForm.value.phone,
        type: this.orderForm.value.type,
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
              this.orderForm.reset();
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
      this.orderForm.markAllAsTouched();
      this._snackBar.open('Заполните необходимые поля');
    }
  }

  closePopup() {
    this.dialogRef?.close();
    this.orderForm.reset();
    this.router.navigate(['/']);
  }

  closePopupSuccess() {
    this.dialogRefSuccess?.close();
    this.router.navigate(['/']);
  }
}
