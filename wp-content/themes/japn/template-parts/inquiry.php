<?php /* Template Name: Inquiry */?>
<?php
get_header('');
/// email procedure
if(isset($_POST['send']) && $_POST['send'] == 'send') {
    $f_name = isset($_POST['f_name']) ? $_POST['f_name'] : '';
    $s_name = isset($_POST['s_name']) ? $_POST['s_name'] : '';
    $sei = isset($_POST['sei']) ? $_POST['sei'] : '';
    $mei = isset($_POST['mei']) ? $_POST['mei'] : '';
    $gender = isset($_POST['gender']) ? $_POST['gender'] : '';
    $b_year = isset($_POST['b_year']) ? $_POST['b_year'] : '';
    $b_month = isset($_POST['b_month']) ? $_POST['b_month'] : '';
    $b_day = isset($_POST['b_day']) ? $_POST['b_day'] : '';
    $age = isset($_POST['age']) ? $_POST['age'] : '';
    $a_fname = isset($_POST['a_fname']) ? $_POST['a_fname'] : '';
    $a_sname = isset($_POST['a_sname']) ? $_POST['a_sname'] : '';
    $a_sei = isset($_POST['a_sei']) ? $_POST['a_sei'] : '';
    $a_mei = isset($_POST['a_mei']) ? $_POST['a_mei'] : '';
    $email_kind = isset($_POST['email_kind']) ? $_POST['email_kind'] : '';
    $email_address = isset($_POST['email_address']) ? $_POST['email_address'] : '';
    $email_address = isset($_POST['email_address']) ? $_POST['email_address'] : '';
    $s_history = isset($_POST['s_history']) ? $_POST['s_history'] : '';
    $phone_kind = isset($_POST['phone_kind']) ? $_POST['phone_kind'] : '';
    $phone_num = isset($_POST['phone_num']) ? $_POST['phone_num'] : '';
    $contact_type = isset($_POST['contact_type']) ? $_POST['contact_type'] : '';
    $f_wish = isset($_POST['f_wish']) ? $_POST['f_wish'] : '';
    $s_wish = isset($_POST['s_wish']) ? $_POST['s_wish'] : '';
    $t_wish = isset($_POST['t_wish']) ? $_POST['t_wish'] : '';
    $inquiry = isset($_POST['inquiry']) ? $_POST['inquiry'] : '';
    $s_agree = isset($_POST['agree_flag']) ? 1 : 0;
    $require_content = isset($_POST['require_content']) ? $_POST['require_content'] : '';
    $to      = 'Info@northgate.co.jp';

    $message = "
    姓 : ".$f_name."<br />
    名 : ".$s_name."<br />
    セイ（カタカナ） : ".$sei."<br />
    メイ（カタカナ） : ".$mei."<br />
    性別 : ".$gender."<br />
    生年月日 : ".$b_year."-" . $b_month . "-" .  $b_day . ' (満' . $age  .  "歳)<br />
    【保護者】姓 : ".$a_fname."<br />
    【保護者】名 : ".$a_sname."<br />
    【保護者】セイ（カタカナ） : ".$a_sei."<br />
    【保護者】メイ（カタカナ） : ".$a_mei."<br />
    Eメールアドレス : ". $email_address . '(' . $email_kind .  ")<br />    
    電話番号 : ". $phone_num . '(' . $phone_kind .  ")<br />        
    連絡手段 : ".$contact_type."<br />
    第1希望 : ".$f_wish."<br />
    第2希望 : ".$s_wish."<br />
    第3希望 : ".$t_wish."<br />
    質問の種類 : ".$inquiry."<br />
    お問い合わせ内容< : ".$require_content."<br />
    ";
    if($s_agree){
        $message .= '当校の個人情報保護方針に同意します​。';
    }
    $subject = 'RequireData';
    $headers = "From: " . $s_email . "\r\n";
    $headers .= "Reply-To: " . $s_email . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    // echo $message;
    if(mail($to, $subject, $message, $headers)) {
        echo '<script>alert("Success!"); location.href="'.home_url().'"</script>';
    } else {
        echo '<script>alert("Failed!"); location.href="'.home_url().'"</script>';
    }   
}
/// email procedure
?>
<!-- CONTAIN_START -->
<section id="contain">
    <div class="inner-block-ap"
        style="background:url(<?php echo get_stylesheet_directory_uri() ?>/images/inner_back.png) no-repeat center center; background-size:cover;">
        <div class="container">
            <div class="row">
                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 inner-block-in-ap">
                    <div class="banner-middle-ap">
                        <div class="banner-box-ap">
                            <div class="banner-box-left-ap">
                                <h1>お問い合わせ</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="contact-block-cop">
        <div class="container">
            <form id="reqFrm" method="post" action="">
                <input type="hidden" name="send" value="send" />
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 contact-block-in-cop">
                        <div class="contact-middle-cop">
                            <div class="contact-info-cop">
                                お問合せいただいてからご回答まで2〜3日ほどお待ちいただく場合がございます。<br>
                                また土日祝・学校休業日の前後は、より回答にお時間をいただいております。<br>
                                お急ぎの場合は、事務局までお電話ください。
                            </div>
                            <div class="contact-term-cop"><span>※</span>は必須項目です。</div>
                            <div class="contact-form-cop">
                                <div class="contact-part-cop">
                                    <div class="contact-part-title-cop">【生徒】</div>
                                    <div class="form-field-main-cop">
                                        <div class="form-field-cop">
                                            <div class="form-field-lable-cop">姓<span>※</span></div>
                                            <div class="form-field-input-cop"><input type="text" name="f_name"
                                                    placeholder="山田"></div>
                                            <div class="clearfix"></div>
                                        </div>
                                        <div class="form-field-cop">
                                            <div class="form-field-lable-cop">名<span>※</span></div>
                                            <div class="form-field-input-cop"><input type="text" name="s_name"
                                                    placeholder="太郎"></div>
                                            <div class="clearfix"></div>
                                        </div>
                                    </div>
                                    <div class="form-field-main-cop">
                                        <div class="form-field-cop">
                                            <div class="form-field-lable-cop">セイ（カタカナ）</div>
                                            <div class="form-field-input-cop"><input type="text" name="sei"
                                                    placeholder="ヤマダ">
                                            </div>
                                            <div class="clearfix"></div>
                                        </div>
                                        <div class="form-field-cop">
                                            <div class="form-field-lable-cop">メイ（カタカナ）</div>
                                            <div class="form-field-input-cop"><input type="text" name="mei"
                                                    placeholder="タロウ">
                                            </div>
                                            <div class="clearfix"></div>
                                        </div>
                                    </div>
                                    <div class="form-field-cop">
                                        <div class="form-field-lable-cop">性別</div>
                                        <div class="form-field-input-cop">
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">男性
                                                        <input type="radio" checked="checked" value="男性" name="gender">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">女性
                                                        <input type="radio" name="gender" value="女性">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">その他
                                                        <input type="radio" name="gender" value="その他">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="clearfix"></div>
                                    </div>
                                    <div class="form-field-cop">
                                        <div class="form-field-lable-cop">生年月日</div>
                                        <div class="form-field-input-cop">
                                            <div class="form-field-select-cop">
                                                <div class="select-cop">
                                                    <select class="custom-select" name="b_year">
                                                        <?php for($i = date('Y') -25 ; $i < date('Y') - 5 ; $i ++) { ?>
                                                        <option value="<?php echo $i ?>"><?php echo $i ?></option>
                                                        <?php } ?>
                                                    </select>
                                                </div>
                                                <div class="select-cop">
                                                    <select class="custom-select" name="b_month">
                                                        <?php for($i = 1 ; $i <= 12 ; $i ++) { ?>
                                                        <option value="<?php echo $i ?>"><?php echo $i ?>月</option>
                                                        <?php }?>
                                                    </select>
                                                </div>
                                                <div class="select-cop">
                                                    <select class="custom-select" name="b_day">
                                                        <?php for($i = 1 ; $i <= 31 ; $i ++) { ?>
                                                        <option value="<?php echo $i ?>"><?php echo $i ?>日</option>
                                                        <?php }?>
                                                    </select>
                                                </div>
                                                <div class="select-cop">
                                                    <select class="custom-select" name="age">
                                                        <?php for($i = 7 ; $i <= 25 ; $i ++) { ?>
                                                        <option value="<?php echo $i ?>">満<?php echo $i ?>歳</option>
                                                        <?php }?>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="clearfix"></div>
                                    </div>
                                </div>
                                <div class="contact-part-cop">
                                    <div class="contact-part-title-cop">【保護者】</div>
                                    <div class="form-field-main-cop">
                                        <div class="form-field-cop">
                                            <div class="form-field-lable-cop">姓<span>※</span></div>
                                            <div class="form-field-input-cop"><input type="text" name="a_fname"
                                                    placeholder="山田"></div>
                                            <div class="clearfix"></div>
                                        </div>
                                        <div class="form-field-cop">
                                            <div class="form-field-lable-cop">名<span>※</span></div>
                                            <div class="form-field-input-cop"><input type="text" name="a_sname"
                                                    placeholder="太郎"></div>
                                            <div class="clearfix"></div>
                                        </div>
                                    </div>
                                    <div class="form-field-main-cop">
                                        <div class="form-field-cop">
                                            <div class="form-field-lable-cop">セイ（カタカナ）</div>
                                            <div class="form-field-input-cop"><input type="text" name="a_sei"
                                                    placeholder="ヤマダ">
                                            </div>
                                            <div class="clearfix"></div>
                                        </div>
                                        <div class="form-field-cop">
                                            <div class="form-field-lable-cop">メイ（カタカナ）</div>
                                            <div class="form-field-input-cop"><input type="text" name="a_mei"
                                                    placeholder="タロウ">
                                            </div>
                                            <div class="clearfix"></div>
                                        </div>
                                    </div>
                                    <div class="form-field-cop">
                                        <div class="form-field-lable-cop">Eメールアドレス<span>※</span></div>
                                        <div class="form-field-input-cop form-field-100-cop">
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">生徒
                                                        <input type="radio" checked="checked" value="生徒"
                                                            name="email_kind">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">保護者
                                                        <input type="radio" value="保護者" name="email_kind">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-field-input-cop"><input type="text" name="email_address"
                                                    placeholder="XXXXXX @gmail.com"></div>
                                        </div>
                                        <div class="clearfix"></div>
                                    </div>
                                    <div class="form-field-cop">
                                        <div class="form-field-lable-cop">電話番号<span>※</span></div>
                                        <div class="form-field-input-cop form-field-100-cop">
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">生徒
                                                        <input type="radio" checked="checked" value="生徒"
                                                            name="phone_kind">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">保護者
                                                        <input type="radio" value="保護者" name="phone_kind">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-field-input-cop"><input type="text" name="phone_num"
                                                    placeholder="0120-589-788">
                                            </div>
                                        </div>
                                        <div class="clearfix"></div>
                                    </div>
                                    <div class="form-field-cop">
                                        <div class="form-field-lable-cop">連絡手段<span>※</span></div>
                                        <div class="form-field-input-cop form-field-100-cop">
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">電話
                                                        <input type="radio" checked="checked" value="電話"
                                                            name="contact_type">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">メール
                                                        <input type="radio" name="contact_type" value="メール">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">どちらでも可
                                                        <input type="radio" name="contact_type" value="どちらでも可">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="clearfix"></div>
                                    </div>
                                    <div class="form-field-cop">
                                        <div class="form-field-lable-cop">連絡希望時間</div>
                                        <div class="form-field-input-cop">
                                            <div class="form-field-select-cop form-field-select-172-cop">
                                                <div class="select-cop">
                                                    <div class="select-text-cop">第1希望</div>
                                                    <select class="custom-select" name="f_wish">
                                                        <option value="9:00〜10:00">9:00〜10:00</option>
                                                        <option value="10:00〜11:00">10:00〜11:00</option>
                                                        <option value="11:00〜12:00">11:00〜12:00</option>
                                                        <option value="12:00〜13:00">12:00〜13:00</option>
                                                        <option value="13:00〜14:00">13:00〜14:00</option>
                                                        <option value="14:00〜15:00">14:00〜15:00</option>
                                                        <option value="15:00〜16:00">15:00〜16:00</option>
                                                        <option value="16:00〜17:00">16:00〜17:00</option>
                                                    </select>
                                                </div>
                                                <div class="select-cop">
                                                    <div class="select-text-cop">第2希望</div>
                                                    <select class="custom-select" name="s_wish">
                                                        <option value="9:00〜10:00">9:00〜10:00</option>
                                                        <option value="10:00〜11:00">10:00〜11:00</option>
                                                        <option value="11:00〜12:00">11:00〜12:00</option>
                                                        <option value="12:00〜13:00">12:00〜13:00</option>
                                                        <option value="13:00〜14:00">13:00〜14:00</option>
                                                        <option value="14:00〜15:00">14:00〜15:00</option>
                                                        <option value="15:00〜16:00">15:00〜16:00</option>
                                                        <option value="16:00〜17:00">16:00〜17:00</option>
                                                    </select>
                                                </div>
                                                <div class="select-cop">
                                                    <div class="select-text-cop">第3希望</div>
                                                    <select class="custom-select" name="t_wish">
                                                        <option value="9:00〜10:00">9:00〜10:00</option>
                                                        <option value="10:00〜11:00">10:00〜11:00</option>
                                                        <option value="11:00〜12:00">11:00〜12:00</option>
                                                        <option value="12:00〜13:00">12:00〜13:00</option>
                                                        <option value="13:00〜14:00">13:00〜14:00</option>
                                                        <option value="14:00〜15:00">14:00〜15:00</option>
                                                        <option value="15:00〜16:00">15:00〜16:00</option>
                                                        <option value="16:00〜17:00">16:00〜17:00</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="clearfix"></div>
                                    </div>
                                    <div class="form-field-cop">
                                        <div class="form-field-lable-cop">質問の種類<span>※</span></div>
                                        <div class="form-field-input-cop form-field-flex-cop">
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">資料請求について
                                                        <input type="radio" checked="checked" value="資料請求について"
                                                            name="inquiry">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">フリースクールについて
                                                        <input type="radio" name="inquiry" value="フリースクールについて">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">通信制高校について
                                                        <input type="radio" name="inquiry" value="通信制高校について">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">資格取得コースについて
                                                        <input type="radio" name="inquiry" value="資格取得コースについて">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">寮生活について
                                                        <input type="radio" name="inquiry" value="寮生活について">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">費用（学費・寮費について）
                                                        <input type="radio" name="inquiry" value="費用（学費・寮費について）">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">入学手続きについて
                                                        <input type="radio" name="inquiry" value="入学手続きについて">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-radio-cop">
                                                <div class="form-field-radio-cop">
                                                    <label class="radio-container-cop">その他
                                                        <input type="radio" name="inquiry" value="その他">
                                                        <span class="checkmark-cop"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="clearfix"></div>
                                    </div>
                                    <div class="form-field-cop">
                                        <div class="form-field-lable-cop">お問い合わせ内容<span>※</span> （できる限り詳細にご記入ください）</div>
                                        <div class="form-field-input-cop"><textarea name="require_content"></textarea>
                                        </div>
                                        <div class="clearfix"></div>
                                    </div>
                                    <div class="form-field-radio-main-cop">
                                        <div class="form-field-radio-cop">
                                            <label class="radio-container-cop">当校の個人情報保護方針に同意します​。
                                                <input type="checkbox" name="agree_flag">
                                                <span class="checkmark-cop"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="contact-btn-cop">
                                        <a id="send" class="common-btn-hp">送信する</a>
                                    </div>
                                    <div class="contact-captcha-cop text-center">
                                        <div class="g-recaptcha" style="display:inline-block;"
                                            data-sitekey="6Ld7SwEcAAAAAPNUHDklT9Xm-dNXdwY3XsHM5igA"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="clearfix"></div>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <div class="clearfix"></div>
</section>
<!-- CONTAIN_END -->
<?php get_footer();
$sss_key = '6Ld7SwEcAAAAAPPVf7B5vqhkm20KET2rNRYepddh';
$site_key = '6Ld7SwEcAAAAAPNUHDklT9Xm-dNXdwY3XsHM5igA';
?>
<script src="<?php echo get_stylesheet_directory_uri() ?>/js/jquery.min.js"></script>
<!-- Include all compiled plugins (below), or include individual files as needed -->
<script src="<?php echo get_stylesheet_directory_uri() ?>/js/bootstrap.min.js"></script>
<script src="<?php echo get_stylesheet_directory_uri() ?>/js/owl.carousel.min.js"></script>
<script src="<?php echo get_stylesheet_directory_uri() ?>/js/custom.js"></script>
<script src="<?php echo get_stylesheet_directory_uri() ?>/js/jquery.validate.min.js"></script>
<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
<script src="https://www.google.com/recaptcha/api.js" async defer></script>
<script type="text/javascript">
$(document).ready(function() {
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
    });
    $('#reqFrm').validate({
        rules: {
            f_name: {
                required: true
            },
            s_name: {
                required: true
            },
            a_fname: {
                required: true
            },
            a_sname: {
                required: true
            }, 
            email_address : {
                required: true
            },
            phone_num : {
                required: true
            }, 
            require_content : {
                required: true
            }
        }, 
        messages : {
            f_name : 'このフィールドは必須です',
            s_name : 'このフィールドは必須です',
            a_fname : 'このフィールドは必須です',
            a_sname : 'このフィールドは必須です',
            email_address : 'このフィールドは必須です',
            phone_num : 'このフィールドは必須です',
            require_content : 'このフィールドは必須です'
        }
    });
    $('#send').on('click', function() {       
        $('#reqFrm').submit();
    })
});
</script>

</body>

</html>