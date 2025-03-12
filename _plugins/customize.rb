#!/usr/bin/env ruby
#
require 'net/http'
require 'nokogiri'
require 'uri'
require 'date'


def load_medium_followers(url, limit = 10)
  return 0 if limit.zero?

  uri = URI(url)
  response = Net::HTTP.get_response(uri)
  case response
  when Net::HTTPSuccess then
      document = Nokogiri::HTML(response.body)

      follower_count_element = document.at('span.pw-follower-count > a')
      follower_count = follower_count_element&.text&.split(' ')&.first

      return follower_count || 0
  when Net::HTTPRedirection then
    location = response['location']
    return load_medium_followers(location, limit - 1)
  else
      return 0
  end
end

$medium_url = "https://medium.com/@cch.chichieh"
# could also define in _config.yml and retrieve in Jekyll::Hooks.register :site, :pre_render do |site| site.config

$medium_followers = load_medium_followers($medium_url)

$medium_followers = 1000 if $medium_followers == 0
$medium_followers = $medium_followers.to_s.reverse.scan(/\d{1,3}/).join(',').reverse


Jekyll::Hooks.register :site, :pre_render do |site|

  unless site.config['tagline'].include?($medium_followers)
    # 處理 Medium followers 顯示
    followMe = <<-HTML
    <div style="
      text-align: left;
      margin: 8px 0;
      font-family: var(--body-font-family);
      display: flex;
      align-items: center;
      gap: 4px;
    ">
      <span style="
        color: var(--text-color);
        font-size: 0.95em;
      ">#{$medium_followers}+ followers on</span>
      <a href="#{$medium_url}" target="_blank" style="
        display: inline-flex;
        align-items: center;
        color: var(--text-color);
        text-decoration: none;
        font-weight: 500;
      ">
        <svg style="
          width: 20px;
          height: 20px;
          margin: 0 4px;
        " viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 12C13 15.3137 10.3137 18 7 18C3.68629 18 1 15.3137 1 12C1 8.68629 3.68629 6 7 6C10.3137 6 13 8.68629 13 12Z"/>
          <path d="M23 12C23 14.7614 22.5523 17 22 17C21.4477 17 21 14.7614 21 12C21 9.23858 21.4477 7 22 7C22.5523 7 23 9.23858 23 12Z"/>
          <path d="M17 12C17 14.7614 16.5523 17 16 17C15.4477 17 15 14.7614 15 12C15 9.23858 15.4477 7 16 7C16.5523 7 17 9.23858 17 12Z"/>
        </svg>
        <span style="color: var(--text-color);">Medium</span>
      </a>
    </div>
    HTML

    tagline = site.config['tagline']
    site.config['tagline'] = "#{followMe}#{tagline}"
  end

  # 處理最後更新時間
  meta_data = site.data.dig('locales', 'en', 'meta')
  if meta_data
    gmt_plus_8 = Time.now.getlocal("+08:00")
    formatted_time = gmt_plus_8.strftime("%Y-%m-%d %H:%M:%S")
    site.data['locales']['en']['meta'] += "<br/>Last updated: #{formatted_time} +08:00"
  end
end

Jekyll::Hooks.register :posts, :pre_render do |post|
  slug = post.data['slug']
  postPath = post.relative_path
  yesterday = (Date.today - 1).to_s

  # 獲取 Medium 和部落格的瀏覽數
  # mediumCount = $stats_data.fetch(slug, {}).fetch("meidum", 0)
  # blogCount = $stats_data.fetch(slug, {}).fetch("siteViews", 0)

  # 移除 "### 支持鼓勵" 後的所有內容
  post.content = post.content.sub(/### 支持鼓勵.*/m, '')
  post.content = post.content.gsub(/(_\[Post\])(.*)(converted from Medium by \[ZMediumToMarkdown\])(.*)(\._)/, '')

  # 添加固定懸浮的 Medium follow 按紐
  floatingButton = <<-HTML
  <div class="floating-medium-button">
    <a href="#{$medium_url}" target="_blank" class="medium-follow-button">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M13 12C13 15.3137 10.3137 18 7 18C3.68629 18 1 15.3137 1 12C1 8.68629 3.68629 6 7 6C10.3137 6 13 8.68629 13 12Z" fill="currentColor"/>
        <path d="M23 12C23 14.7614 22.5523 17 22 17C21.4477 17 21 14.7614 21 12C21 9.23858 21.4477 7 22 7C22.5523 7 23 9.23858 23 12Z" fill="currentColor"/>
        <path d="M17 12C17 14.7614 16.5523 17 16 17C15.4477 17 15 14.7614 15 12C15 9.23858 15.4477 7 16 7C16.5523 7 17 9.23858 17 12Z" fill="currentColor"/>
      </svg>
      Follow me on Medium
    </a>
  </div>

  <style>
    .floating-medium-button {
      position: fixed;
      bottom: 15px;
      right: 20px;
      z-index: 1000;
    }
    
    .medium-follow-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.85rem;
      line-height: 1;
      transition: all 0.3s ease;
      background: var(--button-bg);
      color: var(--btn-text-color);
      border: 1px solid var(--btn-border-color);
      box-shadow: var(--button-shadow);
    }
    
    .medium-follow-button:hover {
      background: var(--button-hover-bg);
      transform: translateY(-1px);
      box-shadow: var(--button-hover-shadow);
      color: var(--btn-text-color);
      text-decoration: none;
    }
    
    @media (max-width: 768px) {
      .floating-medium-button {
        bottom: 15px;
        right: 15px;
      }
      
      .medium-follow-button {
        padding: 6px 12px;
        font-size: 0.85rem;
      }
      
      .medium-follow-button:active {
        background: var(--button-hover-bg);
        transform: translateY(-1px);
        box-shadow: var(--button-hover-shadow);
        color: var(--btn-text-color);
        text-decoration: none;
      }
    }
  </style>
  HTML

  # 如果這篇文章來自 Medium，添加 Medium 連結
  footerHTML = "\n\n---\n\n"
  if postPath.match?(/^_posts\/(en|zh-tw|zh-cn)\/zmediumtomarkdown/)
    footerHTML += <<-HTML
    本文首次發表於 Medium ➡️ <a href="https://medium.com/p/#{slug}" target="_blank"><strong>點此查看</strong></a><br/>
    HTML
  end

  # 添加 BuyMeACoffee 贊助按鈕
  footerHTML += <<-HTML
  <a href="https://www.buymeacoffee.com/chichieh.huang" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
  HTML

  # 更新文章內容
  post.content += floatingButton
  post.content += footerHTML
end
