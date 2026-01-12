import codecs

def convert_utf16_to_utf8(input_file, output_file):
    try:
        with codecs.open(input_file, 'r', 'utf-16') as f_in:
            content = f_in.read()
        with codecs.open(output_file, 'w', 'utf-8') as f_out:
            f_out.write(content)
        print(f"Successfully converted {input_file} to {output_file}")
    except Exception as e:
        print(f"Error during conversion: {e}")

if __name__ == "__main__":
    convert_utf16_to_utf8('analysis_output.txt', 'analysis_output_utf8.txt')
