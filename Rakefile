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
  source = File.read 'jquery.view.js'
  source_for_markdown = []
  source.split(10.chr).each do |line|
    source_for_markdown.push(line.gsub(/^\s?\*\s/,'')) if line.match /^\s?\*\s/
  end
  File.open('index.html', 'w+') do |file|
    file.write <<-eos
      <!DOCTYPE html>
      <html>
        <head>
          <title>jQuery View</title>
        </head>
        <body>
          #{Maruku.new(source_for_markdown.join(10.chr)).to_html}
        </body>
      </html>
    eos
  end
end