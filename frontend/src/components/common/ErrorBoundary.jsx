import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error Caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF7F1] flex items-center justify-center p-4">
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#F0D8CB] shadow-warm-lg max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FCE5D8] text-[#E9653B] flex items-center justify-center shadow-warm-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-black text-[#343434]">
                Something went wrong
              </h2>
              <p className="text-xs md:text-sm text-[#8A817B]">
                An unexpected error occurred in the application view. Please try again.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center px-6 py-3 rounded-2xl bg-[#F47B4A] hover:bg-[#E9653B] text-white font-extrabold text-xs transition-all shadow-warm-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
