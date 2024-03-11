from setuptools import setup, find_packages

setup(
    name='@onedoc/client',
    version='0.1',
    packages=find_packages(),
    install_requires=[
        # List your package's dependencies here, e.g.,
        # 'numpy>=1.18.1',
    ],
    # Additional metadata about your package
    author='Onedoclabs',
    author_email='pierre.dorge@onedoclabs.com',
    description='A Python SDK for Onedoclabs rendering API.',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url='https://github.com/yourusername/your_package_name',
)
