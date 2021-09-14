<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package Japn
 */
global $wp;

?>
<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="ja" xml:lang="ja">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <title>index</title>
    <!-- Bootstrap -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200;300;400;500;600;700;900&display=swap"
        rel="stylesheet">
    <link href="<?php echo get_stylesheet_directory_uri(); ?>/css/bootstrap.min.css" rel="stylesheet">
    <link href="<?php echo get_stylesheet_directory_uri(); ?>/css/fonts.css" rel="stylesheet" type="text/css">
    <link href="<?php echo get_stylesheet_directory_uri(); ?>/css/fontawesome.min.css" rel="stylesheet" type="text/css">
    <link href="<?php echo get_stylesheet_directory_uri(); ?>/css/owl.carousel.css" rel="stylesheet" type="text/css">
    <link href="<?php echo get_stylesheet_directory_uri(); ?>/css/owl.theme.default.css" rel="stylesheet"
        type="text/css">
    <link href="<?php echo get_stylesheet_directory_uri(); ?>/css/stylesheet.css" rel="stylesheet" type="text/css">
    <link href="<?php echo get_stylesheet_directory_uri(); ?>/css/responsive.css" rel="stylesheet" type="text/css">
    
    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
  <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
  <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
<![endif]-->

<body class="">
    <div class="wrapper">
        <!-- HEADER_START -->
        <header id="header" class="header-hp">
            <div class="header-top-hp">
                <div class="container container-1230">
                    <div class="row">
                        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 header-top-in-hp">
                            <div class="logo-hp">
                                <a href="<?php echo get_site_url(); ?>">
                                    <img src="<?php echo get_stylesheet_directory_uri() ?>/images/logo.png" alt="" />
                                </a>
                            </div>
                            <div class="header-right-hp">
                                <div class="header-call-hp">
                                    <img src="<?php echo get_stylesheet_directory_uri() ?>/images/call.svg"
                                        alt="" />0120-589-788<br>
                                    <span>お気軽にお問い合わせください</span>
                                </div>
                            </div>
                            <div class="mobile-menu-icon-hp">
                                <div class="menu-toggle-btn">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="header-bottom-hp">
                <div class="container container-1230">
                    <div class="row">
                        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 header-bottom-in-hp">
                            <div class="navigation">
                                <nav class="navbar navbar-expand-lg navbar-light">
                                    <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
                                        <ul class="navbar-nav">
                                            <li class="nav-item">
                                                <a class="nav-link 
                                            <?php 
                                            if(home_url( $wp->request ) ==  get_site_url()) echo 'active'
                                               ?>" href="<?php echo get_site_url() ?>">HOME</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link 
                                            <?php 
                                            if(home_url( $wp->request ) ==  get_site_url() . '/academy_introduction') echo 'active'
                                               ?>" href="<?php echo get_site_url(); ?>/academy_introduction">
                                                    煌心高等学院<br>とは
                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link <?php 
                                            if(home_url( $wp->request ) ==  get_site_url() . '/free_school_course') echo 'active'
                                               ?>" href="<?php echo get_site_url(); ?>/free_school_course">
                                                    フリースクール<br>コース
                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link <?php 
                                            if(home_url( $wp->request ) ==  get_site_url() . '/correspondence_high_school_course') echo 'active'
                                               ?>"
                                                    href="<?php echo get_site_url(); ?>/correspondence_high_school_course">
                                                    通信制高校<br>コース
                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link <?php 
                                            if(home_url( $wp->request ) ==  get_site_url() . '/qualification_acquisition_course') echo 'active'
                                               ?>"
                                                    href="<?php echo get_site_url(); ?>/qualification_acquisition_course">
                                                    資格取得<br>コース
                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link <?php 
                                            if(home_url( $wp->request ) ==  get_site_url() . '/about_dormitory_life') echo 'active'
                                               ?>" href="<?php echo get_site_url(); ?>/about_dormitory_life">
                                                    寮生活に<br>ついて
                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link <?php 
                                            if(home_url( $wp->request ) ==  get_site_url() . '/about_tuition') echo 'active'
                                               ?>" href="<?php echo get_site_url(); ?>/about_tuition">
                                                    学費・寮費に<br>ついて
                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link <?php 
                                            if(home_url( $wp->request ) ==  get_site_url() . '/inquiry') echo 'active'
                                               ?>" href="<?php echo get_site_url(); ?>/inquiry">
                                                    お問い合わせ
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        <div class="overlay-mobile-menu-hp"></div>
        <div class="clearfix"></div>
        <!-- HEADER_END -->