<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package Japn
 * password : 
 */


?>
<!-- FOOTER_START -->
	<footer id="footer">
    	<div class="back-to-top-hp" id="gototop">
        	<a href="javascript:void(0)"><img src="<?php echo get_stylesheet_directory_uri() ?>/images/backtotop.svg" alt="" /></a>
        </div>
    	<div class="footer-top-hp" style="background:url(<?php echo get_stylesheet_directory_uri() ?>/images/footer_back.png) no-repeat top center; background-size:cover;">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 footer-inner-hp">
                        <div class="footer-links-hp">
                            <ul>
                                <li><a href="<?php echo get_site_url() ?>">HOME</a></li>
                                <li><a href="<?php echo get_site_url() ?>/academy_introduction">煌心高等学校とは</a></li>
                                <li><a href="<?php echo get_site_url() ?>/free_school_course">フリースクールコース</a></li>
                                <li><a href="<?php echo get_site_url() ?>/correspondence_high_school_course">通信制高校コース</a></li>
                            </ul>
                            <ul>
                                <li><a href="<?php echo get_site_url() ?>/qualification_acquisition_course">資格取得コース</a></li>
                                <li><a href="<?php echo get_site_url() ?>/about_dormitory_life">寮生活について</a></li>
                                <li><a href="<?php echo get_site_url() ?>/about_tuition">学費・寮費について</a></li>
                                <li><a href="<?php echo get_site_url() ?>/inquiry">お問い合わせ</a></li>
                            </ul>
                        </div>
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
                        <div class="copyright-hp">©煌心高等学院 Inc. All Rights Reserved.</div>
                        <div class="clearfix"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="clearfix"></div>
    </footer>
<!-- FOOTER_END -->
</div>
