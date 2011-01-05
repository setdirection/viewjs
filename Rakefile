require 'rubygems'

HEADER = /((^\s*\/\/.*\n)+)/

desc "rebuild the jquery.view.js files for distribution"
task :build do
  begin
    require 'closure-compiler'
  rescue LoadError
    puts "closure-compiler not found.\nInstall it by running 'gem install closure-compiler"
    exit
  end
  source = File.read 'jquery.view.js'
  header = source.match(HEADER)
  File.open('jquery.view.min.js', 'w+') do |file|
    file.write header[1].squeeze(' ') + Closure::Compiler.new.compress(source)
  end
end

task :docs do
  require 'Maruku'
  SimpleDoc.new('jquery.view.js',
    :title => 'jQuery View',
    :target => 'docs/index.html',
    :namespace => /(\$\.view|Class\.|instance)/
  )
  #write README
  source = File.read('jquery.view.js')
  readme_lines = []
  lines = source.split("\n")
  lines.each_with_index do |line,i|
    if line.match /^\s+?\/?\*\s/
      break if(line.match(/^\s+?\/?\*\s\-\-\-/))
      readme_lines.push(line.gsub(/^\s+?\/?\*\s/,''))
    end
  end
  readme_lines.pop
  File.open("README.markdown",'w+') do |file|
    file.write readme_lines.join("\n")
  end
end

class SimpleDoc
  def initialize(files,args = {})
    @files = [files] if !files.is_a?(Array)
    @params = {
      :target => args[:target] || 'docs.html',
      :title => args[:title] || ('SimpleDoc Results for ' + @files.join(",")),
      :html => args[:html] || false,
      :namespace => args[:namespace] || false
    }
    File.open(@params[:target],'w+') do |file|
      generated_html = html_from_doc_lines(doc_lines)
      file.write((@params[:html] ? @params[:html] : SimpleDoc.method(:default_html)).call(
        generated_html,
        toc_from_html(generated_html),
        @params[:title]
      ))
    end
  end
  
  protected
  
  def doc_lines
    source_code = @files.collect do |file|
      File.read(file)
    end
    doc_lines = []
    source_code.join("\n").split(10.chr).each do |line|
      doc_lines.push(line.gsub(/^\s+?\/?\*\s/,'')) if line.match /^\s+?\/?\*\s/
    end
    doc_lines
  end
  
  def html_from_doc_lines(source_lines)
    Maruku.new(source_lines.join(10.chr),:unsafe_features => true).to_html
  end
  
  def toc_from_html(html)
    toc = ["<ul>"]
    html.scan(/\<(h1|h2|h3) id='([^']+)'>(.+)/).each do |match|
      tag = match[0]
      id = match[1]
      content = match[2]
      content = content.gsub(/<.+/,'') #remove anything after an HTML tag
      content = content.gsub(/\).+/,'') #remove anything after a method signature
      content = content.gsub('&#8220;','').gsub('&#8221;','') #remove quotes
      if content == 'Class.instance'
        content = 'instance'
      elsif content == '$.view'
        content = '$.view'
      else
        content = content.gsub(@params[:namespace],'') if @params[:namespace] && content != @params[:namespace] #remove namespace
      end
      content = content.gsub(/^\./,'') #remove starting dot if present
      content = content.gsub(/.*\(/,'') #remove anything before ( if present
      if content == 'tag'
        content = false
      end
      if content && content != ''
        toc.push("<#{tag}>#{tag == 'h3' ? '- ' : ''}<a href='##{id}'>#{content}</a></#{tag}>")
      end
    end
    toc.push("</ul>")
    toc.join("\n")
  end
  
  def self.default_html(body,toc,title)
    <<-EOS
<!DOCTYPE html>
<html>
  <head>
    <title>#{title}</title>
    <link rel="stylesheet" media="screen" href="screen.css"/>
  </head>
  <body>
    #{body}
    <div id="toc">#{toc}</div>
  </body>
</html>
    EOS
  end
end