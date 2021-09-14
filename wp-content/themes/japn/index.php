<?php
/**
 * The main template file
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Japn
 */

get_header();
?>

<!-- CONTAIN_START -->
	<section id="contain">
    	<div class="banner-block-hp" style="background:url(<?php echo get_stylesheet_directory_uri() ?>/images/banner.png) no-repeat right center; background-size:cover;">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 banner-block-in-hp">
                    	<div class="banner-middle-hp">
                        	<div class="banner-box-hp">
                            	<div class="banner-box-in-hp">
                                    <h1>
                                        学びを持てる時、<br>
                                        それは心煌めくときなり
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>     
        </div>
        <div class="glorious-block-hp" style="background:url(<?php echo get_stylesheet_directory_uri() ?>/images/glorious_banner.png) no-repeat center center; background-size:cover;">
        	<div class="glorious-overlay-hp">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 glorious-block-in-hp">
                            <div class="glorious-middle-hp">
                                <div class="common-title-hp">
                                    <h2>煌心高等学院とは</h2>
                                    <p>「すべては未来を担う若き人たちのために…」</p>
                                </div>
                                <div class="glorious-btn-hp">
                                    <a href="#" class="common-btn-hp">詳しくはこちら</a>
                                </div>
                            </div>
                            <div class="clearfix"></div>
                        </div>
                    </div>
                </div>
            	<div class="clearfix"></div>
            </div>
            <div class="clearfix"></div>
        </div>
        <div class="step-block-hp">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 step-block-in-hp">
                        <div class="step-middle-hp">
                        	<div class="step-box-hp">
                            	<div class="step-title-hp">学習支援</div>
                                <div class="step-name-hp">
                                	<h3>小学3年生〜中学3年生対象</h3>
                                </div>
                                <div class="step-img-hp"><img src="<?php echo get_stylesheet_directory_uri() ?>/images/step_1_img.svg" alt="" /></div>
                                <h2>フリースクールコース</h2>
                                <div class="step-btn-hp">
                                	<a href="<?php echo get_site_url() ?>/free_school_course" class="common-btn-hp blue-btn-hp">詳しくはこちら</a>
                                </div>
                            </div>
                            <div class="step-box-hp step-box-middle-hp">
                            	<div class="step-title-hp">学習支援</div>
                                <div class="step-name-hp">
                                	<h3>高校卒業を目指したい方</h3>
                                </div>
                                <div class="step-img-hp"><img src="<?php echo get_stylesheet_directory_uri() ?>/images/step_2_img.svg" alt="" /></div>
                                <h2>通信高校コース</h2>
                                <div class="step-btn-hp">
                                	<a href="<?php echo get_site_url() ?>/correspondence_high_school_course" class="common-btn-hp blue-btn-hp">詳しくはこちら</a>
                                </div>
                            </div>
                            <div class="step-box-hp">
                            	<div class="step-title-hp">就労支援</div>
                                <div class="step-name-hp">
                                	<h3>18歳以上の方が対象</h3>
                                </div>
                                <div class="step-img-hp"><img src="<?php echo get_stylesheet_directory_uri() ?>/images/step_3_img.svg" alt="" /></div>
                                <h2>資格取得コース</h2>
                                <div class="step-btn-hp">
                                	<a href="<?php echo get_site_url() ?>/qualification_acquisition_course" class="common-btn-hp blue-btn-hp">詳しくはこちら</a>
                                </div>
                            </div>
                        </div>
                        <div class="clearfix"></div>
                    </div>
                </div>
            </div>
            <div class="clearfix"></div>
        </div>
        <div class="glorious-block-hp glorious-block-left-hp" style="background:url(<?php echo get_stylesheet_directory_uri() ?>/images/dormitory_banner.png) no-repeat center center; background-size:cover;">
        	<div class="glorious-overlay-hp">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 glorious-block-in-hp">
                            <div class="glorious-middle-hp">
                                <div class="common-title-hp">
                                    <h2>寮生活について</h2>
                                    <p>全てのコースで寮に入ることが可能です。（詳細はお問い合わせください）</p>
                                </div>
                                <div class="glorious-btn-hp">
                                    <a href="<?php echo get_site_url() ?>/about_dormitory_life" class="common-btn-hp">詳しくはこちら</a>
                                </div>
                            </div>
                            <div class="clearfix"></div>
                        </div>
                    </div>
                </div>
            	<div class="clearfix"></div>
            </div>
            <div class="clearfix"></div>
        </div>
        <div class="video-block-hp">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 video-block-in-hp">
                    	<div class="video-middle-hp">
                            <div class="video_main">
                                <div class="video-cover-hp" id="video-cover">
                                	<img src="<?php echo get_stylesheet_directory_uri() ?>/images/video_back.png" alt="" />
                                    <div class="video-text-hp">広告動画埋め込みスペース</div>
                                </div>
                                <div class="video-container">
                                	<iframe id="player" width="100%" height="315" src="https://www.youtube.com/embed/yAoLSRbwxL8" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                                </div>
                                <button id="play" class="play-btn">
                                    <img src="<?php echo get_stylesheet_directory_uri() ?>/images/play_btn.svg" alt="" />
                                </button>
                            </div>
                        </div>
                        <div class="clearfix"></div>
                    </div>
                </div>
            </div>
            <div class="clearfix"></div>
        </div>
        <div class="new-block-hp">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 new-block-in-hp">
                    	<div class="common-title-2-hp">
                        	<h2>新着情報</h2>
                            <p>News Topics</p>
                        </div>
                    	<div class="new-middle-hp">
                            <div class="new-left-hp">
                            	<div class="video_main">
                                    <div class="video-cover-hp" id="video-cover_2">
                                        <img src="<?php echo get_stylesheet_directory_uri() ?>/images/video_back_2.png" alt="" />
                                        <div class="video-text-hp">Youtube動画埋め込みスペース</div>
                                    </div>
                                    <div class="video-container">
                                        <iframe id="player_2" width="100%" height="315" src="https://www.youtube.com/embed/yAoLSRbwxL8" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                                    </div>
                                    <button id="play_2" class="play-btn">
                                        <img src="<?php echo get_stylesheet_directory_uri() ?>/images/play_btn_2.svg" alt="" />
                                    </button>
                                </div>
                            </div>
                            <div class="new-right-hp">
                            	<img src="<?php echo get_stylesheet_directory_uri() ?>/images/facebook.png" alt="" />
                            </div>
                        </div>
                        <div class="clearfix"></div>
                    </div>
                </div>
            </div>
            <div class="clearfix"></div>
        </div>
        <div class="flow-block-hp">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 flow-block-in-hp">
                    	<div class="common-title-2-hp">
                        	<h2>入校までの流れ</h2>
                            <p>Flow</p>
                        </div>
                    	<div class="flow-middle-hp">
                            <div class="flow-steps-hp flow-steps-1-hp">
                            	<div class="flow-steps-in-hp">
                                	<div class="flow-number-hp">STEP1</div>
                                    <div class="flow-name-hp">無料相談</div>
                                    <div class="flow-btn-hp">
                                    	<a href="<?php echo get_site_url() ?>/inquiry" class="common-btn-hp">資料請求はこちら</a>
                                    </div>
                                </div>
                            </div>
                            <div class="flow-steps-hp flow-steps-2-hp">
                            	<div class="flow-steps-in-hp">
                                	<div class="flow-number-hp">STEP2</div>
                                    <div class="flow-name-hp">無料面談</div>
                                    <div class="flow-btn-hp">
                                    	<a href="<?php echo get_site_url() ?>/inquiry" class="common-btn-hp">ご予約はこちら</a>
                                    </div>
                                </div>
                            </div>
                            <div class="flow-steps-hp flow-steps-3-hp">
                            	<div class="flow-steps-in-hp">
                                	<div class="flow-number-hp">STEP3</div>
                                    <div class="flow-name-hp">入学手続き</div>
                                </div>
                            </div>
                        </div>
                        <div class="flow-text-hp">どのコースを選択するかで流れは変わりますので、まずは個別にお問合せください。</div>
                        <div class="flow-part-hp">
                        	<div class="flow-part-top-hp">
                            	<div class="flow-part-left-hp">
                                	無料相談<br>受付中
                                </div>
                                <div class="flow-part-right-hp">
                                	<h3>全国からご相談いただいております。</h3>
                                    <div class="flow-call-hp"><img src="<?php echo get_stylesheet_directory_uri() ?>/images/call_footer.svg" alt="" />0120-589-788</div>
                                    <div class="flow-time-hp">受付時間：9:00〜18:00</div>
                                </div>
                            </div>
                            <div class="flow-btn-main-hp">
                            	<a href="<?php echo get_site_url() ?>/inquiry" class="common-btn-hp orange-btn-hp">メールでのお問い合わせはこちら</a>
                            </div>
                        </div>
                        <div class="clearfix"></div>
                    </div>
                </div>
            </div>
            <div class="clearfix"></div>
        </div>
        <div class="map-block-hp">
        	<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d408620.9383878637!2d109.03947385360355!3d34.5562369782508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31508e64e5c642c1%3A0x951daa7c349f366f!2sChina!5e0!3m2!1sen!2sin!4v1627584992647!5m2!1sen!2sin" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
        </div>
        <div class="clearfix"></div>
    </section>
<!-- CONTAIN_END -->
<?php
// get_sidebar();
get_footer();
?>
<script src="<?php echo get_stylesheet_directory_uri() ?>/js/jquery.min.js"></script>
<!-- Include all compiled plugins (below), or include individual files as needed -->
<script src="<?php echo get_stylesheet_directory_uri() ?>/js/bootstrap.min.js"></script>
<script src="<?php echo get_stylesheet_directory_uri() ?>/js/owl.carousel.min.js"></script>
<script src="<?php echo get_stylesheet_directory_uri() ?>/js/custom.js"></script>
<script type="text/javascript">
  $('#play').on('click', function(e) {
	e.preventDefault();
	$("#player")[0].src += "?autoplay=1";
	$('#player').show();
	$('#video-cover').hide();
	$('#play').hide();
  })
  $('#play_2').on('click', function(e) {
	e.preventDefault();
	$("#player_2")[0].src += "?autoplay=1";
	$('#player_2').show();
	$('#video-cover_2').hide();
	$('#play_2').hide();
  })
</script> 
<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
</body>
</html>