
import {Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpService} from "../../http.service";
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-friend-profile',
  templateUrl: './friend-profile.component.html',
  styleUrls: ['./friend-profile.component.css']
})
export class FriendProfileComponent {
    private userId: string;
    private rank: number;
    @ViewChild('noMatchHistory') noMatchHistoryElement: ElementRef;
    @ViewChild('matchHistoryList') matchHistoryListElement: ElementRef;
    @ViewChild('matchHistoryListContainer') matchHistoryListContainerElement: ElementRef;
    @ViewChild('leaderboardList') leaderboardListElement: ElementRef;
    @ViewChild('profilePic') profilePicElement: ElementRef;
    @ViewChild('username') usernameElement: ElementRef;
    @ViewChild('statsWin') statsWinElement: ElementRef;
    @ViewChild('statsLose') statsLoseElement: ElementRef;
    @ViewChild('statsElo') statsEloElement: ElementRef;
  constructor(private route: ActivatedRoute,
    private httpBackend: HttpService,
    private jwtHelper: JwtHelperService,
    private router: Router,
    private renderer: Renderer2) {
      this.rank = 0;
  }
  ngOnInit()
  {
    if (this.jwtHelper.isTokenExpired(localStorage.getItem('jwt')))
      this.router.navigate(['/login']);
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.httpBackend.checkIdExists(this.userId).subscribe(
      (response: boolean) =>
      {
        if (response === false)
          this.router.navigate(['/invalid']);
        else {
          this.httpBackend.getMatchesHistoryById(this.userId).subscribe(
            (response: any) => {
              if (response.length === 0)
              {
                this.matchHistoryListContainerElement.nativeElement.style.visibility = 'hidden';
                this.noMatchHistoryElement.nativeElement.style.visibility = 'visible'
              }
              for (var i = 0; i < response.length; i++)
              {
                if(response[i] !== null)
                  this.addGameToHistory(
                    response[i].yourImg,
                    response[i].oppImg,
                    response[i].yourScore,
                    response[i].oppScore,
                    response[i].victory);
              }
            });
          this.httpBackend.getLeaderBoard().subscribe(
            (response: any) => {
              if (response !== null) {
                for (let i = 0; i < response.length; ++i) {
                  this.addPlayerToLeaderboard(response[i].elo, response[i].user);
                }
              }
            })
          this.httpBackend.getProfileById(this.userId).subscribe(
            (profile: any) => {
              if(this.statsWinElement)
              {
                this.statsWinElement.nativeElement.innerHTML = profile.win;
              }
              if(this.statsLoseElement)
              {
                this.statsLoseElement.nativeElement.innerHTML = profile.lose;
              }
              if(this.statsEloElement)
              {
                this.statsEloElement.nativeElement.innerHTML = profile.elo;
              }
              if (this.usernameElement) {
                this.usernameElement.nativeElement.innerHTML = profile.username;
              }
              if (this.profilePicElement) {
                this.profilePicElement.nativeElement.src = profile.img;
              }
            }
          );
        }
      }
    )
  }
    addGameToHistory(myImg: string, oppImg: string, myscore: number, oppScore: number, result: boolean)
    {
        const newListItem = this.renderer.createElement('li');
        this.renderer.addClass(newListItem, 'match-history-list-elem');

        // Création de l'élément img 1
        const imgElement1 = this.renderer.createElement('img');
        this.renderer.addClass(imgElement1, 'match-history-small-img');
        this.renderer.setAttribute(imgElement1, 'src', myImg);

        // Création de la div center-content 1
        const centerContentDiv1 = this.renderer.createElement('div');
        this.renderer.addClass(centerContentDiv1, 'center-content');

        const scoreElement1 = this.renderer.createElement('p');
        if (result === true)
            this.renderer.addClass(scoreElement1, 'score-win');
        else
            this.renderer.addClass(scoreElement1, 'score-lose');
        const scoreText1 = this.renderer.createText(myscore.toString());//p1Score a la place
        this.renderer.appendChild(scoreElement1, scoreText1);

        const hyphenElement = this.renderer.createElement('p');
        this.renderer.addClass(hyphenElement, 'hyphen');
        const hyphenText = this.renderer.createText(' - ');
        this.renderer.appendChild(hyphenElement, hyphenText);

        const scoreElement2 = this.renderer.createElement('p');
        if (result !== true )
            this.renderer.addClass(scoreElement2, 'score-win');
        else
            this.renderer.addClass(scoreElement2, 'score-lose');
        const scoreText2 = this.renderer.createText(oppScore.toString());//p2Score a la place
        this.renderer.appendChild(scoreElement2, scoreText2);

        this.renderer.appendChild(centerContentDiv1, scoreElement1);
        this.renderer.appendChild(centerContentDiv1, hyphenElement);
        this.renderer.appendChild(centerContentDiv1, scoreElement2);

        // Création de l'élément img 2
        const imgElement2 = this.renderer.createElement('img');
        this.renderer.addClass(imgElement2, 'match-history-small-img');

        this.renderer.setAttribute(imgElement2, 'src', oppImg);//p2Img a la place

        // Création de la div center-content 2
        const centerContentDiv2 = this.renderer.createElement('div');
        this.renderer.addClass(centerContentDiv2, 'center-content');

        const winOrLoseElement = this.renderer.createElement('p');
        if (result === true)
        {
            this.renderer.addClass(winOrLoseElement, 'win');
            const winOrLoseText = this.renderer.createText('WIN');//result a la place
            this.renderer.appendChild(winOrLoseElement, winOrLoseText);
        }

        else
        {
            this.renderer.addClass(winOrLoseElement, 'lose');
            const winOrLoseText = this.renderer.createText('LOSE');//result a la place
            this.renderer.appendChild(winOrLoseElement, winOrLoseText);
        }

        this.renderer.appendChild(centerContentDiv2, winOrLoseElement);

        this.renderer.appendChild(newListItem, imgElement1);
        this.renderer.appendChild(newListItem, centerContentDiv1);
        this.renderer.appendChild(newListItem, imgElement2);
        this.renderer.appendChild(newListItem, centerContentDiv2);

        this.renderer.appendChild(this.matchHistoryListElement.nativeElement, newListItem);
    }
  addPlayerToLeaderboard(elo: number, user: string)
  {
    ++this.rank;
    const newListItem = this.renderer.createElement('li');
    this.renderer.addClass(newListItem, 'leaderboard-list-elem');

    // Création de la div center-content 1
    const centerContentDiv = this.renderer.createElement('div');
    this.renderer.addClass(centerContentDiv, 'center-content');

    const rankElement = this.renderer.createElement('p');
    this.renderer.addClass(rankElement, 'rank');
    const rankText = this.renderer.createText(this.rank.toString());
    this.renderer.appendChild(rankElement, rankText);

    const loginElement = this.renderer.createElement('p');
    this.renderer.addClass(loginElement, 'login');
    const loginText = this.renderer.createText(user);//playerName a la place
    this.renderer.appendChild(loginElement, loginText);

    const eloElement = this.renderer.createElement('p');
    this.renderer.addClass(eloElement, 'elo');
    const eloText = this.renderer.createText(elo + 'pts');//eloPoints a la place
    this.renderer.appendChild(eloElement, eloText);

    this.renderer.appendChild(centerContentDiv, rankElement);
    this.renderer.appendChild(centerContentDiv, loginElement);
    this.renderer.appendChild(centerContentDiv, eloElement);

    this.renderer.appendChild(newListItem, centerContentDiv);

    this.renderer.appendChild(this.leaderboardListElement.nativeElement, newListItem);
  }
}
