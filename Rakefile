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
  source = File.read 'lib/jquery.tmpl.js'
  source += File.read 'jquery.view.js'
  File.open('jquery.view.min.js', 'w+') do |file|
    file.write Closure::Compiler.new.compress(source)
  end
end

task :docs do
  require 'Maruku'
  require '../markprocdoc/markprocdoc'
  MarkProcDoc.new('jquery.view.js',
    :title => 'jQuery View',
    :target => 'docs/index.html',
    :toc => Proc.new{|toc|
      ignore = true
      toc_html = ''
      last_tag = false
      toc.each do |item|
        tag, id, content = item
        ignore = true if content == 'Examples'
        ignore = false if tag == 'h2' && content == 'Class'
        if !ignore
          toc_html += '</td><td>' if last_tag == 'h3' && tag == 'h2'
          if tag == 'h2'
            toc_html += "<h2>#{content}</h2>"
          elsif tag == 'h3'
            content = content.gsub(/^(Class|instance|\$\.view)\./,'')
            toc_html += "<h3>- <a href=\"##{id}\">#{content}</a></h3>"
          end
        end
        last_tag = tag
      end
      toc_html
    },
    :html => Proc.new{|title,body,toc|
      intro = Maruku.new(File.read('README.markdown'),:unsafe_features => false).to_html
      examples = Maruku.new(File.read('examples.markdown'),:unsafe_features => false).to_html
      <<-EOS
<!DOCTYPE html>
<html>
  <head>
    <title>jQuery View: Markup as JavaScript</title>
    <link type="text/css" rel="stylesheet" href="stylesheets/syntax.css"/>
    <link type="text/css" rel="stylesheet" href="stylesheets/screen.css"/>
    <script type="text/javascript" src="javascripts/jquery.js"></script>
    <script type="text/javascript" src="javascripts/jquery.address.js"></script>
    <script type="text/javascript" src="javascripts/jquery.routes.js"></script>
    <script type="text/javascript" src="javascripts/syntax.js"></script>
    <script type="text/javascript" src="javascripts/docs.js"></script>    
  </head>
  <body>
    <div id="content">
      <div id="main">
        #{intro}
        #{body}
        #{examples}
      </div>
      <div id="api_toc">
        <table>
          <tbody>
            <tr>
              <td>
                #{toc}
              </td>
            </tr>
           </tbody>
        </table>
        <div id="api_example"></div>
      </div>
    </div>
    <script type="text/javascript">
      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-20694546-1']);
      _gaq.push(['_trackPageview']);

      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();

    </script>
  </body>
</html>
      EOS
    }
  )
end